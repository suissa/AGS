import { BaseAgent, AgentTask, AgentResult } from '../agent.js';
import { LLMPluginLayer } from '../../llm/llm-plugin-layer.js';
import { EventBus } from '../../events/event-bus.js';

export class BuilderAgent extends BaseAgent {
  private llm: LLMPluginLayer;

  constructor(id: string, llm?: LLMPluginLayer, eventBus?: EventBus) {
    super(id, 'builder', eventBus);
    this.llm = llm ?? new LLMPluginLayer('mock');
  }

  protected async run(task: AgentTask): Promise<Omit<AgentResult, 'agentId' | 'role' | 'durationMs'>> {
    const breakdown = await this.llm.generateTaskBreakdown(task.description);

    return {
      output: JSON.stringify(breakdown, null, 2),
      traces: [`Generated breakdown with ${breakdown.subtasks.length} subtasks`],
      success: true,
    };
  }
}
