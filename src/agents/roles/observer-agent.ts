import { BaseAgent, AgentTask, AgentResult } from '../agent.js';
import { EventBus } from '../../events/event-bus.js';

export class ObserverAgent extends BaseAgent {
  private traces: string[] = [];

  constructor(id: string, eventBus?: EventBus) {
    super(id, 'observer', eventBus);

    if (eventBus) {
      eventBus.subscribe('*', (event) => {
        this.traces.push(`${event.createdAt} [${event.type}] ${JSON.stringify(event.payload).slice(0, 80)}`);
      });
    }
  }

  protected async run(task: AgentTask): Promise<Omit<AgentResult, 'agentId' | 'role' | 'durationMs'>> {
    const snapshot = [...this.traces];

    return {
      output: snapshot.join('\n'),
      traces: snapshot,
      success: true,
    };
  }
}
