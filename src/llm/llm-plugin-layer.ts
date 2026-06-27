import { LLMProvider, LLMRequest, LLMResponse } from './llm-provider.js';
import { MockLLMProvider } from './providers/mock-provider.js';
import { OpenAICompatibleProvider } from './providers/openai-compatible.js';
import { AnthropicCompatibleProvider } from './providers/anthropic-compatible.js';
import { LocalHTTPProvider } from './providers/local-http.js';
import { EventBus } from '../events/event-bus.js';

export interface TaskBreakdown {
  taskId: string;
  title: string;
  subtasks: Array<{ id: string; description: string; type: string }>;
  estimatedComplexity: 'low' | 'medium' | 'high';
}

export type ProviderType = 'openai' | 'anthropic' | 'local' | 'mock';

export class LLMPluginLayer {
  private provider: LLMProvider;
  private eventBus?: EventBus;

  constructor(providerType: ProviderType = 'mock', eventBus?: EventBus) {
    this.provider = LLMPluginLayer.createProvider(providerType);
    this.eventBus = eventBus;
  }

  static createProvider(type: ProviderType): LLMProvider {
    switch (type) {
      case 'openai': return new OpenAICompatibleProvider();
      case 'anthropic': return new AnthropicCompatibleProvider();
      case 'local': return new LocalHTTPProvider();
      case 'mock': return new MockLLMProvider();
    }
  }

  setProvider(provider: LLMProvider): void {
    this.provider = provider;
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.provider.complete(request);

    this.eventBus?.publish('llm.used', {
      provider: this.provider.name,
      model: this.provider.model,
      tokensUsed: response.tokensUsed ?? 0,
    });

    return response;
  }

  async generateTaskBreakdown(taskDescription: string): Promise<TaskBreakdown> {
    const response = await this.complete({
      systemPrompt: 'You are a software task planner. Output valid JSON only.',
      userMessage: `Break down this task into subtasks: "${taskDescription}". Output JSON with fields: taskId (string), title (string), subtasks (array of {id, description, type}), estimatedComplexity (low|medium|high).`,
    });

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      return JSON.parse(jsonMatch[0]) as TaskBreakdown;
    } catch {
      return {
        taskId: `task-${Date.now()}`,
        title: taskDescription.slice(0, 60),
        subtasks: [{ id: 'sub-1', description: taskDescription, type: 'implementation' }],
        estimatedComplexity: 'medium',
      };
    }
  }

  async validateTasksMD(content: string): Promise<{ valid: boolean; issues: string[] }> {
    const response = await this.complete({
      systemPrompt: 'You are a task file validator. Output valid JSON only.',
      userMessage: `Validate this TASKS.md content for AGS format compliance. Output JSON: { valid: boolean, issues: string[] }\n\n${content}`,
    });

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      return JSON.parse(jsonMatch[0]) as { valid: boolean; issues: string[] };
    } catch {
      return { valid: true, issues: [] };
    }
  }

  async reviewCode(code: string, context?: string): Promise<string> {
    const response = await this.complete({
      systemPrompt: 'You are a code reviewer. Be concise and actionable.',
      userMessage: `Review this code${context ? ` (context: ${context})` : ''}:\n\n${code}`,
    });
    return response.text;
  }

  async generateCognitiveReport(ctid: string, traces: unknown[]): Promise<string> {
    const response = await this.complete({
      systemPrompt: 'Generate a structured Cognitive Provenance Report in Markdown. Do not include raw chain-of-thought.',
      userMessage: `Generate a Cognitive Provenance Report for CTID: ${ctid}. Semantic traces: ${JSON.stringify(traces)}`,
    });
    return response.text;
  }
}
