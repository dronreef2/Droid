import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentResponseDto } from './dto/agent-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { AgentStatus } from './entities/agent.entity';

@ApiTags('agents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo agente' })
  @ApiResponse({
    status: 201,
    description: 'Agente criado com sucesso',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async create(
    @Body() createAgentDto: CreateAgentDto,
    @Request() req: any,
  ): Promise<AgentResponseDto> {
    const agent = await this.agentsService.create(
      createAgentDto,
      req.user.userId,
    );
    return plainToInstance(AgentResponseDto, agent);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os agentes do usuário' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AgentStatus,
    description: 'Filtrar por status',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de agentes',
    type: [AgentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findAll(
    @Request() req: any,
    @Query('status') status?: AgentStatus,
  ): Promise<AgentResponseDto[]> {
    const agents = status
      ? await this.agentsService.findAllByStatus(req.user.userId, status)
      : await this.agentsService.findAll(req.user.userId);

    return plainToInstance(AgentResponseDto, agents);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas dos agentes do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas dos agentes',
    schema: {
      properties: {
        total: { type: 'number' },
        active: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getStats(@Request() req: any) {
    const [total, active] = await Promise.all([
      this.agentsService.countByUser(req.user.userId),
      this.agentsService.countActiveByUser(req.user.userId),
    ]);

    return { total, active };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar agente por ID' })
  @ApiParam({ name: 'id', description: 'ID do agente' })
  @ApiResponse({
    status: 200,
    description: 'Agente encontrado',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agente não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<AgentResponseDto> {
    const agent = await this.agentsService.findOne(id, req.user.userId);
    return plainToInstance(AgentResponseDto, agent);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar agente' })
  @ApiParam({ name: 'id', description: 'ID do agente' })
  @ApiResponse({
    status: 200,
    description: 'Agente atualizado',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agente não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async update(
    @Param('id') id: string,
    @Body() updateAgentDto: UpdateAgentDto,
    @Request() req: any,
  ): Promise<AgentResponseDto> {
    const agent = await this.agentsService.update(
      id,
      updateAgentDto,
      req.user.userId,
    );
    return plainToInstance(AgentResponseDto, agent);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover agente' })
  @ApiParam({ name: 'id', description: 'ID do agente' })
  @ApiResponse({ status: 204, description: 'Agente removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Agente não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.agentsService.remove(id, req.user.userId);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Arquivar agente' })
  @ApiParam({ name: 'id', description: 'ID do agente' })
  @ApiResponse({
    status: 200,
    description: 'Agente arquivado',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agente não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async archive(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<AgentResponseDto> {
    const agent = await this.agentsService.archive(id, req.user.userId);
    return plainToInstance(AgentResponseDto, agent);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Ativar agente' })
  @ApiParam({ name: 'id', description: 'ID do agente' })
  @ApiResponse({
    status: 200,
    description: 'Agente ativado',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agente não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async activate(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<AgentResponseDto> {
    const agent = await this.agentsService.activate(id, req.user.userId);
    return plainToInstance(AgentResponseDto, agent);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desativar agente' })
  @ApiParam({ name: 'id', description: 'ID do agente' })
  @ApiResponse({
    status: 200,
    description: 'Agente desativado',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agente não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async deactivate(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<AgentResponseDto> {
    const agent = await this.agentsService.deactivate(id, req.user.userId);
    return plainToInstance(AgentResponseDto, agent);
  }
}
