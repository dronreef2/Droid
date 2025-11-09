import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TasksService } from '../tasks.service';
import { TaskStatus } from '../entities/task.entity';
import { LLMService } from '../../integrations/llm.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';

@Processor('tasks')
export class TaskProcessor {
  private readonly logger = new Logger(TaskProcessor.name);

  constructor(
    private tasksService: TasksService,
    private llmService: LLMService,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  @Process('process-task')
  async handleTask(job: Job) {
    const { taskId } = job.data;

    this.logger.log(`Processing task ${taskId}...`);

    try {
      // Buscar a task com o agent
      const task = await this.tasksRepository.findOne({
        where: { id: taskId },
        relations: ['agent'],
      });

      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      // Atualizar status para processing
      await this.tasksService.updateStatus(taskId, TaskStatus.PROCESSING);

      // Gerar resposta usando LLM
      const llmResponse = await this.llmService.generateCompletion(
        task.agent.model,
        task.agent.systemPrompt,
        task.prompt,
        task.agent.temperature,
        task.agent.maxTokens,
      );

      // Atualizar com sucesso
      await this.tasksService.updateStatus(taskId, TaskStatus.COMPLETED, {
        response: llmResponse.content,
        tokensUsed: llmResponse.tokensUsed,
      });

      this.logger.log(
        `Task ${taskId} completed successfully - Tokens: ${llmResponse.tokensUsed}`,
      );
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
}
