import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../entities/task.entity';
import { AgentResponseDto } from '../../agents/dto/agent-response.dto';

@Exclude()
export class TaskResponseDto {
  @Expose()
  @ApiProperty()
  id!: string;

  @Expose()
  @ApiProperty()
  prompt!: string;

  @Expose()
  @ApiPropertyOptional()
  response?: string;

  @Expose()
  @ApiProperty({ enum: TaskStatus })
  status!: TaskStatus;

  @Expose()
  @ApiProperty({ enum: TaskPriority })
  priority!: TaskPriority;

  @Expose()
  @ApiPropertyOptional()
  error?: string;

  @Expose()
  @ApiProperty()
  retryCount!: number;

  @Expose()
  @ApiProperty()
  maxRetries!: number;

  @Expose()
  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @Expose()
  @ApiPropertyOptional()
  startedAt?: Date;

  @Expose()
  @ApiPropertyOptional()
  completedAt?: Date;

  @Expose()
  @ApiPropertyOptional()
  executionTimeMs?: number;

  @Expose()
  @ApiPropertyOptional()
  tokensUsed?: number;

  @Expose()
  @ApiProperty()
  agentId!: string;

  @Expose()
  @Type(() => AgentResponseDto)
  @ApiPropertyOptional({ type: () => AgentResponseDto })
  agent?: AgentResponseDto;

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
