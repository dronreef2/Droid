import {
  TaskStatus,
  TaskPriority,
} from '../../modules/tasks/entities/task.entity';

export enum TaskEventType {
  TASK_CREATED = 'task.created',
  TASK_PROCESSING = 'task.processing',
  TASK_COMPLETED = 'task.completed',
  TASK_FAILED = 'task.failed',
  TASK_CANCELLED = 'task.cancelled',
  TASK_UPDATED = 'task.updated',
}

export interface TaskEventPayload {
  taskId: string;
  userId: string;
  agentId: string;
  status: TaskStatus;
  priority?: TaskPriority;
  prompt?: string;
  response?: string;
  error?: string;
  tokensUsed?: number;
  executionTimeMs?: number;
  retryCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

export class TaskEventDto {
  event: TaskEventType;
  data: TaskEventPayload;
  timestamp: Date;

  constructor(event: TaskEventType, data: TaskEventPayload) {
    this.event = event;
    this.data = data;
    this.timestamp = new Date();
  }
}
