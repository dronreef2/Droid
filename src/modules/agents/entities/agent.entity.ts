import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum LLMModel {
  GPT_4 = 'gpt-4',
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  CLAUDE_3_OPUS = 'claude-3-opus',
  CLAUDE_3_SONNET = 'claude-3-sonnet',
  CLAUDE_3_HAIKU = 'claude-3-haiku',
  GEMINI_PRO = 'gemini-pro',
}

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text' })
  systemPrompt!: string;

  @Column({
    type: 'enum',
    enum: LLMModel,
    default: LLMModel.GPT_3_5_TURBO,
  })
  model!: LLMModel;

  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.ACTIVE,
  })
  status!: AgentStatus;

  @Column({ type: 'float', default: 0.7 })
  temperature!: number;

  @Column({ type: 'int', default: 1000 })
  maxTokens!: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
