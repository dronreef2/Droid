import { Injectable, Logger } from '@nestjs/common';
import { LLMModel } from '../agents/entities/agent.entity';
import {
  ILLMProvider,
  LLMCompletionRequest,
  LLMCompletionResponse,
} from './interfaces/llm-provider.interface';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private readonly providers: Map<string, ILLMProvider>;

  constructor(
    private openAIProvider: OpenAIProvider,
    private anthropicProvider: AnthropicProvider,
    private openRouterProvider: OpenRouterProvider,
  ) {
    // Map models to their providers
    this.providers = new Map<string, ILLMProvider>();

    // OpenAI models
    this.providers.set(LLMModel.GPT_4, this.openAIProvider);
    this.providers.set(LLMModel.GPT_4_TURBO, this.openAIProvider);
    this.providers.set(LLMModel.GPT_3_5_TURBO, this.openAIProvider);

    // Anthropic models
    this.providers.set(LLMModel.CLAUDE_3_OPUS, this.anthropicProvider);
    this.providers.set(LLMModel.CLAUDE_3_SONNET, this.anthropicProvider);
    this.providers.set(LLMModel.CLAUDE_3_HAIKU, this.anthropicProvider);

    // Google models via OpenRouter
    this.providers.set(LLMModel.GEMINI_PRO, this.openRouterProvider);
  }

  async generateCompletion(
    model: LLMModel,
    systemPrompt: string,
    userPrompt: string,
    temperature?: number,
    maxTokens?: number,
  ): Promise<LLMCompletionResponse> {
    const provider = this.providers.get(model);

    if (!provider) {
      throw new Error(`No provider configured for model: ${model}`);
    }

    this.logger.log(
      `Generating completion with ${provider.getProviderName()} - Model: ${model}`,
    );

    const request: LLMCompletionRequest = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      maxTokens,
    };

    try {
      const startTime = Date.now();
      const response = await provider.generateCompletion(request);
      const duration = Date.now() - startTime;

      this.logger.log(
        `Completion generated in ${duration}ms - Tokens: ${response.tokensUsed}`,
      );

      return response;
    } catch (error) {
      this.logger.error(`Error generating completion with ${model}:`, error);
      throw error;
    }
  }

  getAvailableModels(): LLMModel[] {
    return Array.from(this.providers.keys()) as LLMModel[];
  }

  getProviderForModel(model: LLMModel): string | undefined {
    return this.providers.get(model)?.getProviderName();
  }
}
