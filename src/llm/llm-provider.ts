export interface LLMRequest {
  systemPrompt?: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  text: string;
  model: string;
  provider: string;
  tokensUsed?: number;
  finishReason?: string;
}

export interface LLMProvider {
  name: string;
  model: string;
  complete(input: LLMRequest): Promise<LLMResponse>;
}
