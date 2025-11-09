import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsObject,
  MinLength,
} from 'class-validator';
import { TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Analise este texto e extraia os pontos principais...',
    description: 'Prompt a ser enviado para o agente',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  prompt!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID do agente que executará a tarefa',
  })
  @IsUUID()
  agentId!: string;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.NORMAL,
    description: 'Prioridade da tarefa',
    default: TaskPriority.NORMAL,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: 3,
    description: 'Número máximo de tentativas em caso de falha',
    minimum: 0,
    maximum: 10,
    default: 3,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  maxRetries?: number;

  @ApiPropertyOptional({
    example: { context: 'customer_support', sessionId: 'abc123' },
    description: 'Metadados adicionais da tarefa',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
