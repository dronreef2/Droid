import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { Agent, AgentStatus, LLMModel } from './entities/agent.entity';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

describe('AgentsService', () => {
  let service: AgentsService;

  const mockUserId = 'user-123';
  const mockAgentId = 'agent-123';

  const mockAgent: Agent = {
    id: mockAgentId,
    name: 'Test Agent',
    description: 'Test description',
    systemPrompt: 'You are a helpful assistant',
    model: LLMModel.GPT_3_5_TURBO,
    status: AgentStatus.ACTIVE,
    temperature: 0.7,
    maxTokens: 1000,
    metadata: {},
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
    remove: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        {
          provide: getRepositoryToken(Agent),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AgentsService>(AgentsService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new agent', async () => {
      const createAgentDto: CreateAgentDto = {
        name: 'Test Agent',
        description: 'Test description',
        systemPrompt: 'You are a helpful assistant',
        model: LLMModel.GPT_3_5_TURBO,
      };

      mockRepository.create.mockReturnValue(mockAgent);
      mockRepository.save.mockResolvedValue(mockAgent);

      const result = await service.create(createAgentDto, mockUserId);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createAgentDto,
        userId: mockUserId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockAgent);
      expect(result).toEqual(mockAgent);
    });
  });

  describe('findAll', () => {
    it('should return an array of agents', async () => {
      const agents = [mockAgent];
      mockRepository.find.mockResolvedValue(agents);

      const result = await service.findAll(mockUserId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(agents);
    });
  });

  describe('findAllByStatus', () => {
    it('should return agents filtered by status', async () => {
      const agents = [mockAgent];
      mockRepository.find.mockResolvedValue(agents);

      const result = await service.findAllByStatus(
        mockUserId,
        AgentStatus.ACTIVE,
      );

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUserId, status: AgentStatus.ACTIVE },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(agents);
    });
  });

  describe('findOne', () => {
    it('should return a single agent', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgent);

      const result = await service.findOne(mockAgentId, mockUserId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAgentId, userId: mockUserId },
      });
      expect(result).toEqual(mockAgent);
    });

    it('should throw NotFoundException if agent not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockAgentId, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an agent', async () => {
      const updateAgentDto: UpdateAgentDto = {
        name: 'Updated Agent',
      };

      const updatedAgent = { ...mockAgent, ...updateAgentDto };

      mockRepository.findOne.mockResolvedValue(mockAgent);
      mockRepository.save.mockResolvedValue(updatedAgent);

      const result = await service.update(
        mockAgentId,
        updateAgentDto,
        mockUserId,
      );

      expect(result.name).toEqual('Updated Agent');
    });
  });

  describe('remove', () => {
    it('should remove an agent', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgent);
      mockRepository.remove.mockResolvedValue(mockAgent);

      await service.remove(mockAgentId, mockUserId);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockAgent);
    });
  });

  describe('archive', () => {
    it('should archive an agent', async () => {
      const archivedAgent = { ...mockAgent, status: AgentStatus.ARCHIVED };

      mockRepository.findOne.mockResolvedValue(mockAgent);
      mockRepository.save.mockResolvedValue(archivedAgent);

      const result = await service.archive(mockAgentId, mockUserId);

      expect(result.status).toEqual(AgentStatus.ARCHIVED);
    });
  });

  describe('activate', () => {
    it('should activate an agent', async () => {
      const inactiveAgent = { ...mockAgent, status: AgentStatus.INACTIVE };
      const activatedAgent = { ...mockAgent, status: AgentStatus.ACTIVE };

      mockRepository.findOne.mockResolvedValue(inactiveAgent);
      mockRepository.save.mockResolvedValue(activatedAgent);

      const result = await service.activate(mockAgentId, mockUserId);

      expect(result.status).toEqual(AgentStatus.ACTIVE);
    });
  });

  describe('deactivate', () => {
    it('should deactivate an agent', async () => {
      const deactivatedAgent = { ...mockAgent, status: AgentStatus.INACTIVE };

      mockRepository.findOne.mockResolvedValue(mockAgent);
      mockRepository.save.mockResolvedValue(deactivatedAgent);

      const result = await service.deactivate(mockAgentId, mockUserId);

      expect(result.status).toEqual(AgentStatus.INACTIVE);
    });
  });

  describe('countByUser', () => {
    it('should return the count of agents for a user', async () => {
      mockRepository.count.mockResolvedValue(5);

      const result = await service.countByUser(mockUserId);

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toEqual(5);
    });
  });

  describe('countActiveByUser', () => {
    it('should return the count of active agents for a user', async () => {
      mockRepository.count.mockResolvedValue(3);

      const result = await service.countActiveByUser(mockUserId);

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { userId: mockUserId, status: AgentStatus.ACTIVE },
      });
      expect(result).toEqual(3);
    });
  });
});
