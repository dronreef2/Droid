import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  ILLMProvider,
  LLMCompletionRequest,
  LLMCompletionResponse,
} from '../interfaces/llm-provider.interface';

@Injectable()
export class OpenRouterProvider implements ILLMProvider {
  private readonly logger = new Logger(OpenRouterProvider.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';

    this.client = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer':
          this.configService.get<string>('APP_URL') || 'http://localhost:3000',
        'X-Title': 'Droid AI Agents',
      },
      timeout: 60000,
    });
  }

  async generateCompletion(
    request: LLMCompletionRequest,
  ): Promise<LLMCompletionResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    this.logger.log(
      `Generating completion with OpenRouter model: ${request.model}`,
    );

    try {
      const response = await this.client.post('/chat/completions', {
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1000,
      });

      const choice = response.data.choices[0];
      const usage = response.data.usage;

      return {
        content: choice.message.content,
        tokensUsed: usage?.total_tokens,
        model: response.data.model,
        finishReason: choice.finish_reason,
      };
    } catch (error) {
      this.logger.error('OpenRouter API error:', error);
      throw new Error(
        `OpenRouter API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  getProviderName(): string {
    return 'OpenRouter';
  }
}
