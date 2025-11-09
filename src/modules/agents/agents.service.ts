import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent, AgentStatus } from './entities/agent.entity';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentsRepository: Repository<Agent>,
  ) {}

  async create(createAgentDto: CreateAgentDto, userId: string): Promise<Agent> {
    const agent = this.agentsRepository.create({
      ...createAgentDto,
      userId,
    });

    return this.agentsRepository.save(agent);
  }

  async findAll(userId: string): Promise<Agent[]> {
    return this.agentsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByStatus(userId: string, status: AgentStatus): Promise<Agent[]> {
    return this.agentsRepository.find({
      where: { userId, status },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Agent> {
    const agent = await this.agentsRepository.findOne({
      where: { id, userId },
    });

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${id} not found`);
    }

    return agent;
  }

  async update(
    id: string,
    updateAgentDto: UpdateAgentDto,
    userId: string,
  ): Promise<Agent> {
    const agent = await this.findOne(id, userId);

    Object.assign(agent, updateAgentDto);

    return this.agentsRepository.save(agent);
  }

  async remove(id: string, userId: string): Promise<void> {
    const agent = await this.findOne(id, userId);

    await this.agentsRepository.remove(agent);
  }

  async archive(id: string, userId: string): Promise<Agent> {
    const agent = await this.findOne(id, userId);

    agent.status = AgentStatus.ARCHIVED;

    return this.agentsRepository.save(agent);
  }

  async activate(id: string, userId: string): Promise<Agent> {
    const agent = await this.findOne(id, userId);

    agent.status = AgentStatus.ACTIVE;

    return this.agentsRepository.save(agent);
  }

  async deactivate(id: string, userId: string): Promise<Agent> {
    const agent = await this.findOne(id, userId);

    agent.status = AgentStatus.INACTIVE;

    return this.agentsRepository.save(agent);
  }

  async countByUser(userId: string): Promise<number> {
    return this.agentsRepository.count({ where: { userId } });
  }

  async countActiveByUser(userId: string): Promise<number> {
    return this.agentsRepository.count({
      where: { userId, status: AgentStatus.ACTIVE },
    });
  }
}
