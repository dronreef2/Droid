export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCompletionRequest {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMCompletionResponse {
  content: string;
  tokensUsed?: number;
  model: string;
  finishReason?: string;
}

export interface ILLMProvider {
  generateCompletion(
    request: LLMCompletionRequest,
  ): Promise<LLMCompletionResponse>;

  getProviderName(): string;
}
