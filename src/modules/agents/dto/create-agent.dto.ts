import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsObject,
} from 'class-validator';
import { LLMModel, AgentStatus } from '../entities/agent.entity';

export class CreateAgentDto {
  @ApiProperty({
    example: 'Customer Support Agent',
    description: 'Nome do agente',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: 'Agente especializado em atendimento ao cliente',
    description: 'Descrição detalhada do agente',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example:
      'Você é um assistente prestativo que ajuda clientes com suas dúvidas.',
    description: 'Prompt de sistema que define o comportamento do agente',
  })
  @IsString()
  @MinLength(10)
  systemPrompt!: string;

  @ApiPropertyOptional({
    enum: LLMModel,
    example: LLMModel.GPT_3_5_TURBO,
    description: 'Modelo LLM a ser utilizado',
    default: LLMModel.GPT_3_5_TURBO,
  })
  @IsEnum(LLMModel)
  @IsOptional()
  model?: LLMModel;

  @ApiPropertyOptional({
    enum: AgentStatus,
    example: AgentStatus.ACTIVE,
    description: 'Status do agente',
    default: AgentStatus.ACTIVE,
  })
  @IsEnum(AgentStatus)
  @IsOptional()
  status?: AgentStatus;

  @ApiPropertyOptional({
    example: 0.7,
    description: 'Temperatura para geração de respostas (0.0 a 1.0)',
    minimum: 0,
    maximum: 1,
    default: 0.7,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Número máximo de tokens na resposta',
    minimum: 1,
    maximum: 4000,
    default: 1000,
  })
  @IsNumber()
  @Min(1)
  @Max(4000)
  @IsOptional()
  maxTokens?: number;

  @ApiPropertyOptional({
    example: { category: 'support', priority: 'high' },
    description: 'Metadados adicionais em formato JSON',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
