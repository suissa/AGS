import { BaseAgent } from './agent.js';

export class AgentPool {
  private agents: Map<string, BaseAgent> = new Map();

  register(agent: BaseAgent): void {
    this.agents.set(agent.id, agent);
  }

  get(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }

  getAll(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  getByRole(role: string): BaseAgent[] {
    return this.getAll().filter(a => a.role === role);
  }

  remove(id: string): void {
    this.agents.delete(id);
  }

  get size(): number {
    return this.agents.size;
  }
}
