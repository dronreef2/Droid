import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AgentsService } from '../agents/agents.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectQueue('tasks')
    private tasksQueue: Queue,
    private agentsService: AgentsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    // Verificar se o agente existe e pertence ao usuário
    const agent = await this.agentsService.findOne(
      createTaskDto.agentId,
      userId,
    );

    if (!agent) {
      throw new BadRequestException(
        'Agent not found or does not belong to user',
      );
    }

    const task = this.tasksRepository.create({
      ...createTaskDto,
      userId,
      status: TaskStatus.PENDING,
    });

    const savedTask = await this.tasksRepository.save(task);

    // Adicionar à fila para processamento
    await this.tasksQueue.add(
      'process-task',
      { taskId: savedTask.id },
      {
        priority: this.getPriorityValue(savedTask.priority),
        attempts: savedTask.maxRetries + 1,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    return savedTask;
  }

  async findAll(
    userId: string,
    status?: TaskStatus,
    agentId?: string,
  ): Promise<Task[]> {
    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (agentId) {
      where.agentId = agentId;
    }

    return this.tasksRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['agent'],
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id, userId },
      relations: ['agent'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    // Não permitir atualização de tasks em processamento ou concluídas
    if (
      task.status === TaskStatus.PROCESSING ||
      task.status === TaskStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot update task with status ${task.status}`,
      );
    }

    Object.assign(task, updateTaskDto);

    return this.tasksRepository.save(task);
  }

  async cancel(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed task');
    }

    task.status = TaskStatus.CANCELLED;

    return this.tasksRepository.save(task);
  }

  async retry(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    if (task.status !== TaskStatus.FAILED) {
      throw new BadRequestException('Can only retry failed tasks');
    }

    task.status = TaskStatus.PENDING;
    task.retryCount = 0;
    task.error = undefined;

    const savedTask = await this.tasksRepository.save(task);

    // Adicionar novamente à fila
    await this.tasksQueue.add(
      'process-task',
      { taskId: savedTask.id },
      {
        priority: this.getPriorityValue(savedTask.priority),
      },
    );

    return savedTask;
  }

  async updateStatus(
    taskId: string,
    status: TaskStatus,
    data?: Partial<Task>,
  ): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    task.status = status;

    if (status === TaskStatus.PROCESSING) {
      task.startedAt = new Date();
    }

    if (status === TaskStatus.COMPLETED || status === TaskStatus.FAILED) {
      task.completedAt = new Date();
      if (task.startedAt) {
        task.executionTimeMs =
          task.completedAt.getTime() - task.startedAt.getTime();
      }
    }

    if (data) {
      Object.assign(task, data);
    }

    return this.tasksRepository.save(task);
  }

  async getStats(userId: string): Promise<any> {
    const [total, pending, processing, completed, failed] = await Promise.all([
      this.tasksRepository.count({ where: { userId } }),
      this.tasksRepository.count({
        where: { userId, status: TaskStatus.PENDING },
      }),
      this.tasksRepository.count({
        where: { userId, status: TaskStatus.PROCESSING },
      }),
      this.tasksRepository.count({
        where: { userId, status: TaskStatus.COMPLETED },
      }),
      this.tasksRepository.count({
        where: { userId, status: TaskStatus.FAILED },
      }),
    ]);

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      successRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
    };
  }

  private getPriorityValue(priority: TaskPriority): number {
    const priorityMap = {
      [TaskPriority.URGENT]: 1,
      [TaskPriority.HIGH]: 2,
      [TaskPriority.NORMAL]: 3,
      [TaskPriority.LOW]: 4,
    };
    return priorityMap[priority] || 3;
  }
}
