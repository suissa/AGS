import { loadConfig } from '../config/load-config.js';
import { EventBus } from '../events/event-bus.js';
import { CTIDRegistry } from '../ctid/ctid-registry.js';
import { ProjectSyncRulesEngine } from '../sync/project-sync-rules-engine.js';
import { GitHubRestClient } from '../github/github-rest-client.js';
import { parseWorkflowRuns } from '../cicd/workflow-run-parser.js';
import { CICDMappingEngine } from '../cicd/cicd-mapping-engine.js';
import { AGSTUI } from '../tui/ags-tui.js';
import { WikiGenerator } from '../wiki/wiki-generator.js';

export interface ProjectSyncOptions {
  dryRun?: boolean;
  cwd?: string;
}

export async function runProjectSync(opts: ProjectSyncOptions = {}): Promise<void> {
  const cwd = opts.cwd ?? process.cwd();
  const config = loadConfig(cwd);

  const dryRun = opts.dryRun ?? config.dryRun;

  console.log(`[ags] Starting project sync for "${config.name}" (${config.owner}/${config.repo})`);
  console.log(`[ags] Mode: ${config.mode} | Dry Run: ${dryRun}`);

  const eventBus = new EventBus();

  const ctidRegistry = new CTIDRegistry(config.repo);
  await ctidRegistry.load();

  const syncEngine = new ProjectSyncRulesEngine({
    owner: config.owner,
    repo: config.repo,
    mode: config.mode,
    dryRun,
  });
  syncEngine.attachToEventBus(eventBus);

  let tui: AGSTUI | undefined;
  if (config.tui) {
    tui = new AGSTUI(config.mode, `${config.owner}/${config.repo}`);
    tui.attach(eventBus);
    tui.start();
  }

  if (!dryRun && process.env['GITHUB_TOKEN']) {
    const gh = new GitHubRestClient(process.env['GITHUB_TOKEN']);

    try {
      const issues = await gh.listIssues({ owner: config.owner, repo: config.repo, state: 'open' });
      console.log(`[ags] Found ${issues.length} open issues.`);

      for (const issue of issues) {
        const existing = ctidRegistry.findByIssue(issue.number);
        if (!existing) {
          const record = ctidRegistry.create(issue.number);
          eventBus.publish('task.created', {
            issueNumber: issue.number,
            title: issue.title,
          }, { ctid: record.ctid });
        }
      }

      const { workflow_runs } = await gh.listWorkflowRuns({ owner: config.owner, repo: config.repo });
      const parsed = parseWorkflowRuns(workflow_runs);

      const cicdEngine = new CICDMappingEngine(eventBus, { syncEngine });
      cicdEngine.processRuns(parsed);

    } catch (err) {
      console.error(`[ags] GitHub API error: ${(err as Error).message}`);
    }
  } else {
    console.log('[ags] Dry-run mode: emitting sample events...');

    eventBus.publish('task.created', { issueNumber: 1, title: 'Sample task' }, { ctid: 'ctid_sample_1_dryrun01' });
    eventBus.publish('ci.success', { stage: 'test' });
    eventBus.publish('pr.opened', { prNumber: 1, title: 'Feature branch' });
  }

  if (config.wiki) {
    const wikiGen = new WikiGenerator({
      owner: config.owner,
      repo: config.repo,
      version: config.version ?? '0.1.0',
      dryRun,
      cwd,
    });

    wikiGen.generateHome(config.name, `AGS-managed project: ${config.name}`);
    wikiGen.generateCTIDIndex(ctidRegistry.getAll());
    console.log('[ags] Wiki pages generated in docs/wiki/');
  }

  await ctidRegistry.save();
  console.log('[ags] Sync complete.');

  tui?.stop();
}
