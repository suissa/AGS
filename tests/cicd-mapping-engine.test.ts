import { CICDMappingEngine } from '../src/cicd/cicd-mapping-engine.js';
import { WorkflowRunSummary } from '../src/cicd/cicd-types.js';
import { parseWorkflowRun } from '../src/cicd/workflow-run-parser.js';
import { EventBus } from '../src/events/event-bus.js';
import { EventLogWriter } from '../src/events/event-log-writer.js';
import { GitHubWorkflowRun } from '../src/github/types.js';

function makeBus() {
  const bus = new EventBus('/dev/null');
  (bus as unknown as { logWriter: EventLogWriter }).logWriter.disable();
  return bus;
}

function makeRun(name: string, conclusion: 'success' | 'failure'): WorkflowRunSummary {
  return {
    id: 1,
    name,
    stage: 'test',
    status: 'completed',
    conclusion,
    branch: 'main',
    sha: 'abc123',
    url: 'https://github.com',
    createdAt: new Date().toISOString(),
  };
}

describe('CICDMappingEngine', () => {
  it('emits ci.failed for test failure', () => {
    const bus = makeBus();
    const events: string[] = [];
    bus.subscribe('ci.failed', () => events.push('ci.failed'));

    const engine = new CICDMappingEngine(bus);
    engine.processRun(makeRun('test', 'failure'));

    expect(events).toContain('ci.failed');
  });

  it('emits ci.success for success', () => {
    const bus = makeBus();
    const events: string[] = [];
    bus.subscribe('ci.success', () => events.push('ci.success'));

    const engine = new CICDMappingEngine(bus);
    engine.processRun(makeRun('deploy', 'success'));

    expect(events).toContain('ci.success');
  });

  it('does not process in-progress runs', () => {
    const bus = makeBus();
    const events: string[] = [];
    bus.subscribe('*', (e) => events.push(e.type));

    const engine = new CICDMappingEngine(bus);
    engine.processRun({ ...makeRun('test', 'failure'), status: 'in_progress' });

    expect(events).toHaveLength(0);
  });

  it('processes multiple runs', () => {
    const bus = makeBus();
    const events: string[] = [];
    bus.subscribe('*', (e) => events.push(e.type));

    const engine = new CICDMappingEngine(bus);
    engine.processRuns([makeRun('lint', 'failure'), makeRun('build', 'success')]);

    expect(events.length).toBeGreaterThanOrEqual(2);
  });

  it('parses workflow run to detect stage', () => {
    const raw: GitHubWorkflowRun = {
      id: 1,
      name: 'Jest Tests',
      status: 'completed',
      conclusion: 'failure',
      html_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      head_branch: 'main',
      head_sha: 'abc',
    };
    const parsed = parseWorkflowRun(raw);
    expect(parsed.stage).toBe('test');
    expect(parsed.conclusion).toBe('failure');
  });
});
