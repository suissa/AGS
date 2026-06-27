import { LLMProvider, LLMRequest, LLMResponse } from '../llm-provider.js';

export class OpenAICompatibleProvider implements LLMProvider {
  name = 'openai-compatible';
  model: string;
  private baseUrl: string;
  private apiKey: string;

  constructor(options: { model?: string; baseUrl?: string; apiKey?: string } = {}) {
    this.model = options.model ?? 'gpt-4o';
    this.baseUrl = options.baseUrl ?? process.env['OPENAI_BASE_URL'] ?? 'https://api.openai.com/v1';
    this.apiKey = options.apiKey ?? process.env['OPENAI_API_KEY'] ?? '';
  }

  async complete(input: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) throw new Error('OPENAI_API_KEY is not set');

    const messages: Array<{ role: string; content: string }> = [];
    if (input.systemPrompt) messages.push({ role: 'system', content: input.systemPrompt });
    messages.push({ role: 'user', content: input.userMessage });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: input.maxTokens ?? 4096,
        temperature: input.temperature ?? 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string }; finish_reason: string }>;
      usage?: { total_tokens: number };
      model: string;
    };

    return {
      text: data.choices[0]?.message.content ?? '',
      model: data.model,
      provider: this.name,
      tokensUsed: data.usage?.total_tokens,
      finishReason: data.choices[0]?.finish_reason,
    };
  }
}
