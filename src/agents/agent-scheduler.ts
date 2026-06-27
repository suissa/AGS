import { BaseAgent, AgentResult, AgentTask } from './agent.js';
import { AgentPool } from './agent-pool.js';

export interface SchedulerOptions {
  timeoutMs?: number;
}

export interface SchedulerResult {
  results: AgentResult[];
  timedOut: string[];
  durationMs: number;
}

export class AgentScheduler {
  private pool: AgentPool;
  private defaultTimeoutMs: number;

  constructor(pool: AgentPool, options: SchedulerOptions = {}) {
    this.pool = pool;
    this.defaultTimeoutMs = options.timeoutMs ?? 30_000;
  }

  async runParallel(task: AgentTask, agentIds?: string[]): Promise<SchedulerResult> {
    const agents = agentIds
      ? agentIds.map(id => this.pool.get(id)).filter(Boolean) as BaseAgent[]
      : this.pool.getAll();

    const start = Date.now();
    const timedOut: string[] = [];

    const promises = agents.map(agent =>
      this.runWithTimeout(agent, task, timedOut)
    );

    const results = await Promise.all(promises);

    return {
      results: results.filter(Boolean) as AgentResult[],
      timedOut,
      durationMs: Date.now() - start,
    };
  }

  private async runWithTimeout(
    agent: BaseAgent,
    task: AgentTask,
    timedOut: string[]
  ): Promise<AgentResult | null> {
    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => {
        timedOut.push(agent.id);
        resolve(null);
      }, this.defaultTimeoutMs)
    );

    const result = await Promise.race([agent.execute(task), timeout]);
    return result;
  }

  async runSequential(task: AgentTask, agentIds?: string[]): Promise<SchedulerResult> {
    const agents = agentIds
      ? agentIds.map(id => this.pool.get(id)).filter(Boolean) as BaseAgent[]
      : this.pool.getAll();

    const start = Date.now();
    const results: AgentResult[] = [];
    const timedOut: string[] = [];

    for (const agent of agents) {
      const result = await this.runWithTimeout(agent, task, timedOut);
      if (result) results.push(result);
    }

    return { results, timedOut, durationMs: Date.now() - start };
  }
}
