import { LLMProvider, LLMRequest, LLMResponse } from '../llm-provider.js';

export class AnthropicCompatibleProvider implements LLMProvider {
  name = 'anthropic';
  model: string;
  private apiKey: string;

  constructor(options: { model?: string; apiKey?: string } = {}) {
    this.model = options.model ?? 'claude-sonnet-4-6';
    this.apiKey = options.apiKey ?? process.env['ANTHROPIC_API_KEY'] ?? '';
  }

  async complete(input: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: input.maxTokens ?? 4096,
      messages: [{ role: 'user', content: input.userMessage }],
    };

    if (input.systemPrompt) {
      body['system'] = input.systemPrompt;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
      model: string;
      stop_reason: string;
      usage?: { input_tokens: number; output_tokens: number };
    };

    const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');

    return {
      text,
      model: data.model,
      provider: this.name,
      tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      finishReason: data.stop_reason,
    };
  }
}
