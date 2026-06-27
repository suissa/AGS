import { BaseAgent, AgentTask, AgentResult } from '../agent.js';
import { LLMPluginLayer } from '../../llm/llm-plugin-layer.js';
import { EventBus } from '../../events/event-bus.js';

export class UnifierAgent extends BaseAgent {
  private llm: LLMPluginLayer;

  constructor(id: string, llm?: LLMPluginLayer, eventBus?: EventBus) {
    super(id, 'unifier', eventBus);
    this.llm = llm ?? new LLMPluginLayer('mock');
  }

  protected async run(task: AgentTask): Promise<Omit<AgentResult, 'agentId' | 'role' | 'durationMs'>> {
    const unified = await this.llm.complete({
      systemPrompt: 'You are a code unifier. Consolidate the best parts of multiple implementations into one.',
      userMessage: `Unify outputs for task "${task.taskId}": ${task.context ?? task.description}`,
    });

    return {
      output: unified.text,
      traces: ['Unification complete'],
      success: true,
    };
  }
}
