import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { EventsService } from './events.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private eventsService: EventsService) {}

  afterInit(server: Server) {
    this.eventsService.setServer(server);
    this.logger.log('WebSocket Gateway initialized');
  }

  @UseGuards(WsJwtGuard)
  async handleConnection(client: Socket) {
    try {
      const user = client.data.user;
      const userId = user.sub || user.id;

      // Join user-specific room
      const room = `user:${userId}`;
      await client.join(room);

      this.logger.log(
        `Client connected: ${client.id} - User: ${userId} - Room: ${room}`,
      );

      // Send connection confirmation
      client.emit('connected', {
        clientId: client.id,
        userId,
        timestamp: new Date(),
        message: 'Successfully connected to real-time events',
      });

      // Notify user of active connections
      const socketsInRoom = await this.server.in(room).fetchSockets();
      client.emit('connections.count', {
        count: socketsInRoom.length,
      });
    } catch (error) {
      this.logger.error('Error handling connection:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    const userId = user?.sub || user?.id || 'unknown';

    this.logger.log(`Client disconnected: ${client.id} - User: ${userId}`);
  }

  @SubscribeMessage('ping')
  @UseGuards(WsJwtGuard)
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: any): any {
    this.logger.log(`Ping received from ${client.id}`);
    return {
      event: 'pong',
      data: {
        timestamp: new Date(),
        clientId: client.id,
        message: data?.message || 'pong',
      },
    };
  }

  @SubscribeMessage('subscribe.tasks')
  @UseGuards(WsJwtGuard)
  async handleSubscribeTasks(@ConnectedSocket() client: Socket): Promise<any> {
    const user = client.data.user;
    const userId = user.sub || user.id;

    this.logger.log(
      `Client ${client.id} subscribed to tasks for user ${userId}`,
    );

    return {
      event: 'subscribed.tasks',
      data: {
        userId,
        timestamp: new Date(),
        message: 'Successfully subscribed to task updates',
      },
    };
  }

  @SubscribeMessage('unsubscribe.tasks')
  @UseGuards(WsJwtGuard)
  async handleUnsubscribeTasks(
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const user = client.data.user;
    const userId = user.sub || user.id;

    this.logger.log(
      `Client ${client.id} unsubscribed from tasks for user ${userId}`,
    );

    return {
      event: 'unsubscribed.tasks',
      data: {
        userId,
        timestamp: new Date(),
        message: 'Successfully unsubscribed from task updates',
      },
    };
  }
}
