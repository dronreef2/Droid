import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LLMService } from './llm.service';
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    LLMService,
    OpenAIProvider,
    AnthropicProvider,
    OpenRouterProvider,
  ],
  exports: [LLMService],
})
export class IntegrationsModule {}
