import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { LLMModel, AgentStatus } from '../entities/agent.entity';

@Exclude()
export class AgentResponseDto {
  @Expose()
  @ApiProperty()
  id!: string;

  @Expose()
  @ApiProperty()
  name!: string;

  @Expose()
  @ApiProperty({ required: false })
  description?: string;

  @Expose()
  @ApiProperty()
  systemPrompt!: string;

  @Expose()
  @ApiProperty({ enum: LLMModel })
  model!: LLMModel;

  @Expose()
  @ApiProperty({ enum: AgentStatus })
  status!: AgentStatus;

  @Expose()
  @ApiProperty()
  temperature!: number;

  @Expose()
  @ApiProperty()
  maxTokens!: number;

  @Expose()
  @ApiProperty({ required: false })
  metadata?: Record<string, any>;

  @Expose()
  @ApiProperty()
  userId!: string;

  @Expose()
  @ApiProperty()
  createdAt!: Date;

  @Expose()
  @ApiProperty()
  updatedAt!: Date;
}
