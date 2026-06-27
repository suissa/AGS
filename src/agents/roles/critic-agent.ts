import { BaseAgent, AgentTask, AgentResult } from '../agent.js';
import { LLMPluginLayer } from '../../llm/llm-plugin-layer.js';
import { EventBus } from '../../events/event-bus.js';

export class CriticAgent extends BaseAgent {
  private llm: LLMPluginLayer;

  constructor(id: string, llm?: LLMPluginLayer, eventBus?: EventBus) {
    super(id, 'critic', eventBus);
    this.llm = llm ?? new LLMPluginLayer('mock');
  }

  protected async run(task: AgentTask): Promise<Omit<AgentResult, 'agentId' | 'role' | 'durationMs'>> {
    const review = await this.llm.reviewCode(task.context ?? task.description, task.taskId);

    return {
      output: review,
      traces: ['Code review completed'],
      success: true,
    };
  }
}
