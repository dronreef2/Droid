import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export class LLMMessageDto {
  @IsEnum(['system', 'user', 'assistant'])
  role!: 'system' | 'user' | 'assistant';

  @IsString()
  content!: string;
}

export class LLMCompletionRequestDto {
  @IsString()
  model!: string;

  @IsArray()
  messages!: LLMMessageDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4000)
  maxTokens?: number;
}
