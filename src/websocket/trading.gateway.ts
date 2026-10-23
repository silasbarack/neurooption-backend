import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/trading' })
export class TradingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(TradingGateway.name);
  private clientUserMap = new Map<string, string>();
  private userClientMap = new Map<string, Set<string>>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) { client.disconnect(); return; }
      const payload = this.jwtService.verify(token);
      this.clientUserMap.set(client.id, payload.sub);
      if (!this.userClientMap.has(payload.sub)) this.userClientMap.set(payload.sub, new Set());
      this.userClientMap.get(payload.sub).add(client.id);
      client.join(`user:${payload.sub}`);
      client.emit('connected', { userId: payload.sub, socketId: client.id });
      this.logger.log(`Client connected: ${client.id} → User: ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.clientUserMap.get(client.id);
    if (userId) {
      this.userClientMap.get(userId)?.delete(client.id);
      this.clientUserMap.delete(client.id);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:market')
  subscribeMarket(@ConnectedSocket() client: Socket, @MessageBody() assetIds: string[]) {
    assetIds.forEach(id => client.join(`market:${id}`));
    return { subscribed: assetIds };
  }

  @SubscribeMessage('unsubscribe:market')
  unsubscribeMarket(@ConnectedSocket() client: Socket, @MessageBody() assetIds: string[]) {
    assetIds.forEach(id => client.leave(`market:${id}`));
    return { unsubscribed: assetIds };
  }

  @OnEvent('market.tick')
  handleMarketTick(ticks: any[]) {
    ticks.forEach(tick => {
      this.server.to(`market:${tick.assetId}`).emit('price', tick);
    });
    this.server.emit('prices:all', ticks);
  }

  @OnEvent('trade.placed')
  handleTradePlaced({ userId, trade }: any) {
    this.server.to(`user:${userId}`).emit('trade:placed', trade);
  }

  @OnEvent('trade.settled')
  handleTradeSettled({ userId, trade }: any) {
    this.server.to(`user:${userId}`).emit('trade:settled', trade);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  getConnectedCount(): number {
    return this.clientUserMap.size;
  }
}
