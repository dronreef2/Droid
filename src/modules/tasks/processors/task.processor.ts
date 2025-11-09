import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TasksService } from '../tasks.service';
import { TaskStatus } from '../entities/task.entity';

@Processor('tasks')
export class TaskProcessor {
  private readonly logger = new Logger(TaskProcessor.name);

  constructor(private tasksService: TasksService) {}

  @Process('process-task')
  async handleTask(job: Job) {
    const { taskId } = job.data;

    this.logger.log(`Processing task ${taskId}...`);

    try {
      // Atualizar status para processing
      await this.tasksService.updateStatus(taskId, TaskStatus.PROCESSING);

      // TODO: Aqui será implementada a integração com LLMs
      // Por enquanto, simular um processamento
      const response = await this.simulateTaskProcessing(taskId);

      // Atualizar com sucesso
      await this.tasksService.updateStatus(taskId, TaskStatus.COMPLETED, {
        response,
      });

      this.logger.log(`Task ${taskId} completed successfully`);
    } catch (error) {
      this.logger.error(`Task ${taskId} failed:`, error);

      // Atualizar com erro
      await this.tasksService.updateStatus(taskId, TaskStatus.FAILED, {
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: job.attemptsMade,
      });

      throw error; // Re-throw para que Bull possa retentar se necessário
    }
  }

  private async simulateTaskProcessing(taskId: string): Promise<string> {
    // Simulação temporária - será substituída pela integração real com LLMs
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `Simulated response for task ${taskId}. This will be replaced with actual LLM integration.`;
  }
}
