import { AgentPool } from '../src/agents/agent-pool.js';
import { AgentScheduler } from '../src/agents/agent-scheduler.js';
import { BaseAgent, AgentTask, AgentResult } from '../src/agents/agent.js';

class MockAgent extends BaseAgent {
  private delay: number;
  private shouldFail: boolean;

  constructor(id: string, delay = 0, shouldFail = false) {
    super(id, 'builder');
    this.delay = delay;
    this.shouldFail = shouldFail;
  }

  protected async run(_task: AgentTask): Promise<Omit<AgentResult, 'agentId' | 'role' | 'durationMs'>> {
    if (this.delay > 0) {
      await new Promise(r => setTimeout(r, this.delay));
    }
    if (this.shouldFail) {
      throw new Error(`${this.id} failed`);
    }
    return {
      output: `output from ${this.id}`,
      traces: [`trace-${this.id}`],
      success: true,
    };
  }
}

describe('AgentScheduler', () => {
  it('runs all agents in parallel', async () => {
    const pool = new AgentPool();
    pool.register(new MockAgent('a1'));
    pool.register(new MockAgent('a2'));
    pool.register(new MockAgent('a3'));

    const scheduler = new AgentScheduler(pool);
    const task: AgentTask = { taskId: 'task-1', description: 'test task' };

    const result = await scheduler.runParallel(task);
    expect(result.results).toHaveLength(3);
    expect(result.timedOut).toHaveLength(0);
  });

  it('runs specific agents by id', async () => {
    const pool = new AgentPool();
    pool.register(new MockAgent('a1'));
    pool.register(new MockAgent('a2'));
    pool.register(new MockAgent('a3'));

    const scheduler = new AgentScheduler(pool);
    const task: AgentTask = { taskId: 'task-2', description: 'test' };

    const result = await scheduler.runParallel(task, ['a1', 'a3']);
    expect(result.results).toHaveLength(2);
    expect(result.results.map(r => r.agentId)).toContain('a1');
    expect(result.results.map(r => r.agentId)).toContain('a3');
  });

  it('handles agent failure gracefully', async () => {
    const pool = new AgentPool();
    pool.register(new MockAgent('good', 0, false));
    pool.register(new MockAgent('bad', 0, true));

    const scheduler = new AgentScheduler(pool);
    const task: AgentTask = { taskId: 'task-3', description: 'test' };

    const result = await scheduler.runParallel(task);
    expect(result.results).toHaveLength(2);
    const bad = result.results.find(r => r.agentId === 'bad');
    expect(bad?.success).toBe(false);
    expect(bad?.error).toBeTruthy();
  });

  it('times out slow agents', async () => {
    const pool = new AgentPool();
    pool.register(new MockAgent('slow', 200));

    const scheduler = new AgentScheduler(pool, { timeoutMs: 50 });
    const task: AgentTask = { taskId: 'task-4', description: 'test' };

    const result = await scheduler.runParallel(task);
    expect(result.timedOut).toContain('slow');
  }, 5000);

  it('runs agents sequentially', async () => {
    const pool = new AgentPool();
    const order: string[] = [];

    class OrderAgent extends BaseAgent {
      constructor(id: string) {
        super(id, 'builder');
      }
      protected async run(_task: AgentTask): Promise<Omit<AgentResult, 'agentId' | 'role' | 'durationMs'>> {
        order.push(this.id);
        return { output: this.id, traces: [], success: true };
      }
    }

    pool.register(new OrderAgent('first'));
    pool.register(new OrderAgent('second'));

    const scheduler = new AgentScheduler(pool);
    await scheduler.runSequential({ taskId: 't', description: 'x' });
    expect(order).toEqual(['first', 'second']);
  });
});
