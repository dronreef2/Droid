import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { TaskStatus } from './entities/task.entity';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova tarefa' })
  @ApiResponse({
    status: 201,
    description: 'Tarefa criada e adicionada à fila',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: any,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.create(createTaskDto, req.user.userId);
    return plainToInstance(TaskResponseDto, task);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas do usuário' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    description: 'Filtrar por status',
  })
  @ApiQuery({
    name: 'agentId',
    required: false,
    description: 'Filtrar por agente',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tarefas',
    type: [TaskResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findAll(
    @Request() req: any,
    @Query('status') status?: TaskStatus,
    @Query('agentId') agentId?: string,
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.tasksService.findAll(
      req.user.userId,
      status,
      agentId,
    );
    return plainToInstance(TaskResponseDto, tasks);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas das tarefas' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas das tarefas',
    schema: {
      properties: {
        total: { type: 'number' },
        pending: { type: 'number' },
        processing: { type: 'number' },
        completed: { type: 'number' },
        failed: { type: 'number' },
        successRate: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getStats(@Request() req: any) {
    return this.tasksService.getStats(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tarefa por ID' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa encontrada',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.findOne(id, req.user.userId);
    return plainToInstance(TaskResponseDto, task);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa atualizada',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou status inválido',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.update(
      id,
      updateTaskDto,
      req.user.userId,
    );
    return plainToInstance(TaskResponseDto, task);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa cancelada',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({ status: 400, description: 'Não é possível cancelar tarefa' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async cancel(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.cancel(id, req.user.userId);
    return plainToInstance(TaskResponseDto, task);
  }

  @Patch(':id/retry')
  @ApiOperation({ summary: 'Retentar tarefa falhada' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa adicionada novamente à fila',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Apenas tarefas falhadas podem ser retentadas',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async retry(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<TaskResponseDto> {
    const task = await this.tasksService.retry(id, req.user.userId);
    return plainToInstance(TaskResponseDto, task);
  }
}
