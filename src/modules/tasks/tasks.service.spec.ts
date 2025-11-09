import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { AgentsService } from '../agents/agents.service';
import { EventsService } from '../../events/events.service';
import { CreateTaskDto } from './dto/create-task.dto';

describe('TasksService', () => {
  let service: TasksService;

  const mockUserId = 'user-123';
  const mockAgentId = 'agent-123';
  const mockTaskId = 'task-123';

  const mockAgent = {
    id: mockAgentId,
    name: 'Test Agent',
    userId: mockUserId,
  };

  const mockTask: Task = {
    id: mockTaskId,
    prompt: 'Test prompt',
    response: undefined,
    status: TaskStatus.PENDING,
    priority: TaskPriority.NORMAL,
    error: undefined,
    retryCount: 0,
    maxRetries: 3,
    metadata: {},
    startedAt: undefined,
    completedAt: undefined,
    executionTimeMs: undefined,
    tokensUsed: undefined,
    agentId: mockAgentId,
    agent: mockAgent as any,
    userId: mockUserId,
    user: {} as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  const mockAgentsService = {
    findOne: jest.fn(),
  };

  const mockEventsService = {
    emitTaskEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
        {
          provide: getQueueToken('tasks'),
          useValue: mockQueue,
        },
        {
          provide: AgentsService,
          useValue: mockAgentsService,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task and add to queue', async () => {
      const createTaskDto: CreateTaskDto = {
        prompt: 'Test prompt for analysis',
        agentId: mockAgentId,
        priority: TaskPriority.NORMAL,
      };

      mockAgentsService.findOne.mockResolvedValue(mockAgent);
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);
      mockQueue.add.mockResolvedValue({});

      const result = await service.create(createTaskDto, mockUserId);

      expect(mockAgentsService.findOne).toHaveBeenCalledWith(
        mockAgentId,
        mockUserId,
      );
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-task',
        { taskId: mockTask.id },
        expect.any(Object),
      );
      expect(result).toEqual(mockTask);
    });

    it('should throw BadRequestException if agent not found', async () => {
      const createTaskDto: CreateTaskDto = {
        prompt: 'Test prompt',
        agentId: 'non-existent-agent',
      };

      mockAgentsService.findOne.mockResolvedValue(null);

      await expect(service.create(createTaskDto, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const tasks = [mockTask];
      mockRepository.find.mockResolvedValue(tasks);

      const result = await service.findAll(mockUserId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { createdAt: 'DESC' },
        relations: ['agent'],
      });
      expect(result).toEqual(tasks);
    });

    it('should filter tasks by status', async () => {
      const tasks = [mockTask];
      mockRepository.find.mockResolvedValue(tasks);

      const result = await service.findAll(mockUserId, TaskStatus.COMPLETED);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId, status: TaskStatus.COMPLETED },
        order: { createdAt: 'DESC' },
        relations: ['agent'],
      });
      expect(result).toEqual(tasks);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne(mockTaskId, mockUserId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTaskId, userId: mockUserId },
        relations: ['agent'],
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockTaskId, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a pending task', async () => {
      const cancelledTask = { ...mockTask, status: TaskStatus.CANCELLED };

      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(cancelledTask);

      const result = await service.cancel(mockTaskId, mockUserId);

      expect(result.status).toEqual(TaskStatus.CANCELLED);
    });

    it('should throw BadRequestException if trying to cancel completed task', async () => {
      const completedTask = { ...mockTask, status: TaskStatus.COMPLETED };

      mockRepository.findOne.mockResolvedValue(completedTask);

      await expect(service.cancel(mockTaskId, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('retry', () => {
    it('should retry a failed task', async () => {
      const failedTask = { ...mockTask, status: TaskStatus.FAILED };
      const retriedTask = { ...failedTask, status: TaskStatus.PENDING };

      mockRepository.findOne.mockResolvedValue(failedTask);
      mockRepository.save.mockResolvedValue(retriedTask);
      mockQueue.add.mockResolvedValue({});

      const result = await service.retry(mockTaskId, mockUserId);

      expect(result.status).toEqual(TaskStatus.PENDING);
      expect(mockQueue.add).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return task statistics', async () => {
      mockRepository.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(2) // pending
        .mockResolvedValueOnce(1) // processing
        .mockResolvedValueOnce(6) // completed
        .mockResolvedValueOnce(1); // failed

      const result = await service.getStats(mockUserId);

      expect(result).toEqual({
        total: 10,
        pending: 2,
        processing: 1,
        completed: 6,
        failed: 1,
        successRate: '60.00',
      });
    });
  });
});
