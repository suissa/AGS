import {
  ConvergenceState,
  AgentOutput,
  createInitialConvergenceState,
} from './convergence-state.js';
import { ConvergenceChecker } from './convergence-checker.js';
import { ContextArtifactWriter } from './context-artifact-writer.js';
import { EventBus } from '../events/event-bus.js';

export interface LoopBuilder {
  build(): Promise<AgentOutput[]>;
  review(outputs: AgentOutput[]): Promise<AgentOutput[]>;
  test(outputs: AgentOutput[]): Promise<AgentOutput[]>;
  unify(outputs: AgentOutput[]): Promise<string>;
}

export interface LoopUntilDoneOptions {
  taskId: string;
  ctid?: string;
  maxIterations?: number;
  builder: LoopBuilder;
  eventBus?: EventBus;
  cwd?: string;
}

interface ResolvedOptions {
  taskId: string;
  ctid?: string;
  maxIterations: number;
  builder: LoopBuilder;
  eventBus: EventBus;
  cwd: string;
}

export class LoopUntilDone {
  private checker: ConvergenceChecker;
  private artifactWriter: ContextArtifactWriter;
  private options: ResolvedOptions;

  constructor(options: LoopUntilDoneOptions) {
    this.options = {
      maxIterations: 5,
      eventBus: new EventBus(),
      cwd: process.cwd(),
      ...options,
    };
    this.checker = new ConvergenceChecker();
    this.artifactWriter = new ContextArtifactWriter(this.options.cwd);
  }

  async run(): Promise<ConvergenceState> {
    const state = createInitialConvergenceState(
      this.options.taskId,
      this.options.maxIterations,
      this.options.ctid
    );
    state.status = 'running';

    const { builder, maxIterations, eventBus, taskId, ctid } = this.options;

    for (let i = 0; i < maxIterations; i++) {
      state.iteration = i + 1;
      console.log(`[loop] Iteration ${state.iteration}/${maxIterations}`);

      const built = await builder.build();
      const reviewed = await builder.review(built);
      const tested = await builder.test(reviewed);

      state.outputs = tested;

      const check = this.checker.check(tested);
      console.log(`[loop] Convergence check: ${check.converged ? 'CONVERGED' : 'NOT YET'}`);
      for (const reason of check.reasons) {
        console.log(`  - ${reason}`);
      }

      if (check.converged) {
        state.unifiedOutput = await builder.unify(tested);
        state.status = 'converged';
        state.finishedAt = new Date().toISOString();

        const artifactPath = this.artifactWriter.write(state);
        console.log(`[loop] Context artifact written: ${artifactPath}`);

        eventBus.publish('task.converged', { taskId, ctid, artifactPath }, { ctid });
        return state;
      }
    }

    state.status = 'failed';
    state.finishedAt = new Date().toISOString();

    const artifactPath = this.artifactWriter.write(state);
    console.log(`[loop] Max iterations reached. Artifact: ${artifactPath}`);

    eventBus.publish('task.failed', {
      taskId,
      ctid,
      reason: `Max iterations (${maxIterations}) exceeded`,
      artifactPath,
    }, { ctid });

    return state;
  }
}
