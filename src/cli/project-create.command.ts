import { writeConfig } from '../config/write-config.js';
import { AGSConfig } from '../config/ags-config.schema.js';
import { ProjectProvisioner } from '../projects/project-provisioner.js';
import { CTIDRegistry } from '../ctid/ctid-registry.js';
import { validateTasksMDFile, formatValidationReport } from '../tasks/tasks-md-validator.js';

export interface ProjectCreateOptions {
  name?: string;
  owner?: string;
  repo?: string;
  mode?: 'simple' | 'allascode';
  tasksGenerated?: boolean;
  tasksPath?: string;
  tui?: boolean;
  dryRun?: boolean;
  wiki?: boolean;
}

async function promptInteractive(): Promise<ProjectCreateOptions> {
  const { default: inquirer } = await import('inquirer');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      validate: (v: string) => v.length > 0 || 'Name is required',
    },
    {
      type: 'input',
      name: 'ownerRepo',
      message: 'Owner/Repo (e.g. suissa/my-project):',
      validate: (v: string) => v.includes('/') || 'Format: owner/repo',
    },
    {
      type: 'list',
      name: 'mode',
      message: 'Mode:',
      choices: ['simple', 'allascode'],
      default: 'simple',
    },
    {
      type: 'confirm',
      name: 'tasksGenerated',
      message: 'Tasks already generated? (TASKS_GENERATED=true)',
      default: false,
    },
    {
      type: 'input',
      name: 'tasksPath',
      message: 'Path to tasks .md file:',
      when: (a: Record<string, unknown>) => a['tasksGenerated'] === true,
    },
    {
      type: 'confirm',
      name: 'tui',
      message: 'Enable TUI?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'wiki',
      message: 'Enable Wiki generation?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'dryRun',
      message: 'Dry run? (no real GitHub calls)',
      default: true,
    },
  ]);

  const [owner, repo] = String(answers['ownerRepo']).split('/');

  return {
    name: String(answers['name']),
    owner,
    repo,
    mode: answers['mode'] as 'simple' | 'allascode',
    tasksGenerated: Boolean(answers['tasksGenerated']),
    tasksPath: answers['tasksPath'] ? String(answers['tasksPath']) : undefined,
    tui: Boolean(answers['tui']),
    wiki: Boolean(answers['wiki']),
    dryRun: Boolean(answers['dryRun']),
  };
}

export async function runProjectCreate(opts: ProjectCreateOptions = {}): Promise<void> {
  let options = opts;

  const isInteractive = !opts.name || !opts.owner || !opts.repo;
  if (isInteractive) {
    options = await promptInteractive();
  }

  const { name, owner, repo, mode = 'simple', tasksGenerated = false, tasksPath, tui = false, dryRun = false, wiki = false } = options;

  if (!name || !owner || !repo) {
    throw new Error('Missing required options: name, owner, repo');
  }

  console.log(`\n[ags] Creating project "${name}" (${owner}/${repo}) in ${mode} mode...`);

  if (tasksGenerated && tasksPath) {
    console.log(`\n[ags] Validating tasks file: ${tasksPath}`);
    const report = validateTasksMDFile(tasksPath);
    console.log(formatValidationReport(report));
    if (!report.valid) {
      console.warn('[ags] Task validation failed. Fix issues above before proceeding.');
    }
  }

  const provisioner = new ProjectProvisioner({ owner, mode, dryRun, token: process.env['GITHUB_TOKEN'] });
  const projects = await provisioner.provision();
  console.log(`\n[ags] Provisioned ${projects.length} project(s).`);

  const registry = new CTIDRegistry(repo);
  await registry.load();
  await registry.save();

  const config: AGSConfig = {
    name,
    owner,
    repo,
    mode,
    tasksGenerated,
    tasksPath,
    tui,
    dryRun,
    wiki,
    createdAt: new Date().toISOString(),
    version: '0.1.0',
  };

  writeConfig(config);
  console.log(`\n[ags] Config written to .ags/config.json`);
  console.log(`[ags] Project "${name}" created successfully.`);

  if (tui) {
    console.log('[ags] TUI enabled. Run "ags project sync" to start.');
  }
}
