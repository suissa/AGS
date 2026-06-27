import { LLMProvider, LLMRequest, LLMResponse } from '../llm-provider.js';

export class LocalHTTPProvider implements LLMProvider {
  name = 'local';
  model: string;
  private endpoint: string;

  constructor(options: { model?: string; endpoint?: string } = {}) {
    this.model = options.model ?? 'llama3';
    this.endpoint = options.endpoint ?? process.env['LOCAL_LLM_URL'] ?? 'http://localhost:11434/api/generate';
  }

  async complete(input: LLMRequest): Promise<LLMResponse> {
    const prompt = input.systemPrompt
      ? `${input.systemPrompt}\n\n${input.userMessage}`
      : input.userMessage;

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: input.temperature ?? 0.2,
          num_predict: input.maxTokens ?? 4096,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Local LLM error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { response: string; eval_count?: number };

    return {
      text: data.response,
      model: this.model,
      provider: this.name,
      tokensUsed: data.eval_count,
      finishReason: 'stop',
    };
  }
}
