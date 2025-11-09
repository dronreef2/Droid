import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TaskProcessor } from './processors/task.processor';
import { AgentsModule } from '../agents/agents.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    BullModule.registerQueue({
      name: 'tasks',
    }),
    AgentsModule,
    IntegrationsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskProcessor],
  exports: [TasksService],
})
export class TasksModule {}
