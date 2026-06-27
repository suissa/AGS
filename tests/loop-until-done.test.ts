import { LoopUntilDone, LoopBuilder } from '../src/convergence/loop-until-done.js';
import { AgentOutput } from '../src/convergence/convergence-state.js';
import { EventBus } from '../src/events/event-bus.js';
import { EventLogWriter } from '../src/events/event-log-writer.js';
import { tmpdir } from 'os';

function makeBus() {
  const bus = new EventBus('/dev/null');
  (bus as unknown as { logWriter: EventLogWriter }).logWriter.disable();
  return bus;
}

function makeBuilder(opts: {
  passAfterIteration?: number;
}): LoopBuilder {
  let iteration = 0;
  const passAfter = opts.passAfterIteration ?? 1;

  return {
    async build(): Promise<AgentOutput[]> {
      iteration++;
      const passing = iteration >= passAfter;
      return [{
        agentId: 'builder-a',
        content: `output-${iteration}`,
        testsPass: passing,
        hasConflicts: false,
        issues: passing ? [] : [`iteration ${iteration} not ready`],
      }];
    },
    async review(outputs: AgentOutput[]): Promise<AgentOutput[]> { return outputs; },
    async test(outputs: AgentOutput[]): Promise<AgentOutput[]> { return outputs; },
    async unify(outputs: AgentOutput[]): Promise<string> { return outputs.map(o => o.content).join('\n'); },
  };
}

describe('LoopUntilDone', () => {
  const cwd = tmpdir();

  it('converges on first iteration', async () => {
    const bus = makeBus();
    const loop = new LoopUntilDone({
      taskId: 'task-conv',
      maxIterations: 3,
      builder: makeBuilder({ passAfterIteration: 1 }),
      eventBus: bus,
      cwd,
    });

    const state = await loop.run();
    expect(state.status).toBe('converged');
    expect(state.iteration).toBe(1);
  });

  it('converges after multiple iterations', async () => {
    const bus = makeBus();
    const loop = new LoopUntilDone({
      taskId: 'task-slow',
      maxIterations: 5,
      builder: makeBuilder({ passAfterIteration: 3 }),
      eventBus: bus,
      cwd,
    });

    const state = await loop.run();
    expect(state.status).toBe('converged');
    expect(state.iteration).toBe(3);
  });

  it('fails after max iterations', async () => {
    const bus = makeBus();
    const failEvents: string[] = [];
    bus.subscribe('task.failed', () => failEvents.push('failed'));

    const loop = new LoopUntilDone({
      taskId: 'task-fail',
      maxIterations: 2,
      builder: makeBuilder({ passAfterIteration: 99 }),
      eventBus: bus,
      cwd,
    });

    const state = await loop.run();
    expect(state.status).toBe('failed');
    expect(state.iteration).toBe(2);
    expect(failEvents).toHaveLength(1);
  });

  it('emits task.converged event on success', async () => {
    const bus = makeBus();
    const events: string[] = [];
    bus.subscribe('task.converged', () => events.push('converged'));

    const loop = new LoopUntilDone({
      taskId: 'task-ev',
      ctid: 'ctid_test_1_abc12345',
      maxIterations: 3,
      builder: makeBuilder({ passAfterIteration: 1 }),
      eventBus: bus,
      cwd,
    });

    await loop.run();
    expect(events).toHaveLength(1);
  });
});
