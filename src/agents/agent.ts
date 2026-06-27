import { EventBus } from '../events/event-bus.js';

export type AgentRole = 'builder' | 'critic' | 'tester' | 'unifier' | 'observer';

export interface AgentResult {
  agentId: string;
  role: AgentRole;
  output: string;
  traces: string[];
  success: boolean;
  error?: string;
  durationMs: number;
}

export interface AgentTask {
  taskId: string;
  ctid?: string;
  description: string;
  context?: string;
}

export abstract class BaseAgent {
  readonly id: string;
  readonly role: AgentRole;
  protected eventBus?: EventBus;

  constructor(id: string, role: AgentRole, eventBus?: EventBus) {
    this.id = id;
    this.role = role;
    this.eventBus = eventBus;
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    const start = Date.now();

    this.eventBus?.publish('agent.started', {
      name: this.id,
      role: this.role,
      taskId: task.taskId,
    }, { ctid: task.ctid });

    try {
      const result = await this.run(task);
      const durationMs = Date.now() - start;

      this.eventBus?.publish('agent.completed', {
        name: this.id,
        role: this.role,
        taskId: task.taskId,
        durationMs,
      }, { ctid: task.ctid });

      return { ...result, agentId: this.id, role: this.role, durationMs };
    } catch (err) {
      const durationMs = Date.now() - start;

      this.eventBus?.publish('agent.failed', {
        name: this.id,
        role: this.role,
        taskId: task.taskId,
        error: (err as Error).message,
      }, { ctid: task.ctid });

      return {
        agentId: this.id,
        role: this.role,
        output: '',
        traces: [],
        success: false,
        error: (err as Error).message,
        durationMs,
      };
    }
  }

  protected abstract run(task: AgentTask): Promise<Omit<AgentResult, 'agentId' | 'role' | 'durationMs'>>;
}
