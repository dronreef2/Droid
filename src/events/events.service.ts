import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import {
  TaskEventDto,
  TaskEventType,
  TaskEventPayload,
} from './dto/task-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private server: Server | null = null;

  setServer(server: Server): void {
    this.server = server;
    this.logger.log('WebSocket server registered in EventsService');
  }

  emitTaskEvent(eventType: TaskEventType, payload: TaskEventPayload): void {
    if (!this.server) {
      this.logger.warn(
        'WebSocket server not initialized, skipping event emission',
      );
      return;
    }

    const event = new TaskEventDto(eventType, payload);
    const room = `user:${payload.userId}`;

    this.logger.log(
      `Emitting ${eventType} to room ${room} for task ${payload.taskId}`,
    );

    // Emit to specific user room
    this.server.to(room).emit(eventType, event);

    // Also emit generic 'task.event' for clients listening to all events
    this.server.to(room).emit('task.event', event);
  }

  emitToUser(userId: string, event: string, data: any): void {
    if (!this.server) {
      this.logger.warn(
        'WebSocket server not initialized, skipping event emission',
      );
      return;
    }

    const room = `user:${userId}`;
    this.server.to(room).emit(event, data);
  }

  // Broadcast to all connected clients (use with caution)
  broadcast(event: string, data: any): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized, skipping broadcast');
      return;
    }

    this.server.emit(event, data);
  }
}
