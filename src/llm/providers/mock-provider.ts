import { LLMProvider, LLMRequest, LLMResponse } from '../llm-provider.js';

export class MockLLMProvider implements LLMProvider {
  name = 'mock';
  model = 'mock-v1';

  private responses: Map<string, string>;

  constructor(responses?: Map<string, string>) {
    this.responses = responses ?? new Map();
  }

  setResponse(pattern: string, response: string): void {
    this.responses.set(pattern, response);
  }

  async complete(input: LLMRequest): Promise<LLMResponse> {
    for (const [pattern, response] of this.responses.entries()) {
      if (input.userMessage.includes(pattern)) {
        return {
          text: response,
          model: this.model,
          provider: this.name,
          tokensUsed: response.length,
          finishReason: 'stop',
        };
      }
    }

    return {
      text: `[mock response for: ${input.userMessage.slice(0, 50)}...]`,
      model: this.model,
      provider: this.name,
      tokensUsed: 10,
      finishReason: 'stop',
    };
  }
}
