import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  ILLMProvider,
  LLMCompletionRequest,
  LLMCompletionResponse,
} from '../interfaces/llm-provider.interface';

@Injectable()
export class OpenAIProvider implements ILLMProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';

    this.client = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
  }

  async generateCompletion(
    request: LLMCompletionRequest,
  ): Promise<LLMCompletionResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    this.logger.log(
      `Generating completion with OpenAI model: ${request.model}`,
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
      this.logger.error('OpenAI API error:', error);
      throw new Error(
        `OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  getProviderName(): string {
    return 'OpenAI';
  }
}
