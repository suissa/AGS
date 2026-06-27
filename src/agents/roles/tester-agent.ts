import { BaseAgent, AgentTask, AgentResult } from '../agent.js';
import { EventBus } from '../../events/event-bus.js';

export class TesterAgent extends BaseAgent {
  constructor(id: string, eventBus?: EventBus) {
    super(id, 'tester', eventBus);
  }

  protected async run(task: AgentTask): Promise<Omit<AgentResult, 'agentId' | 'role' | 'durationMs'>> {
    return {
      output: `[tester] Tests stubbed for task: ${task.taskId}. Run npm test for actual results.`,
      traces: ['Test execution stub'],
      success: true,
    };
  }
}
