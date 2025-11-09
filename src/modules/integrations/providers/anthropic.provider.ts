import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  ILLMProvider,
  LLMCompletionRequest,
  LLMCompletionResponse,
} from '../interfaces/llm-provider.interface';

@Injectable()
export class AnthropicProvider implements ILLMProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ANTHROPIC_API_KEY') || '';

    this.client = axios.create({
      baseURL: 'https://api.anthropic.com/v1',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });
  }

  async generateCompletion(
    request: LLMCompletionRequest,
  ): Promise<LLMCompletionResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    this.logger.log(
      `Generating completion with Claude model: ${request.model}`,
    );

    try {
      // Separate system messages from user/assistant messages
      const systemMessage = request.messages.find(m => m.role === 'system');
      const conversationMessages = request.messages.filter(
        m => m.role !== 'system',
      );

      const response = await this.client.post('/messages', {
        model: request.model,
        max_tokens: request.maxTokens ?? 1000,
        temperature: request.temperature ?? 0.7,
        system: systemMessage?.content,
        messages: conversationMessages,
      });

      const content = response.data.content[0].text;
      const usage = response.data.usage;

      return {
        content,
        tokensUsed: usage?.input_tokens + usage?.output_tokens,
        model: response.data.model,
        finishReason: response.data.stop_reason,
      };
    } catch (error) {
      this.logger.error('Anthropic API error:', error);
      throw new Error(
        `Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  getProviderName(): string {
    return 'Anthropic';
  }
}
