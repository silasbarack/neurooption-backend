import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Interval } from '@nestjs/schedule';
import { MarketsService } from '../markets/markets.service';
import { SignalsService } from '../signals/signals.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private authenticatedClients: Map<string, { userId: string; subscriptions: Set<string> }> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly marketsService: MarketsService,
    private readonly signalsService: SignalsService,
  ) {}

  // ─── Connection Lifecycle ─────────────────────────────────────────────────

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token);
      this.authenticatedClients.set(client.id, {
        userId: payload.sub,
        subscriptions: new Set(),
      });

      // Send initial market snapshot
      const ticks = this.marketsService.getAllTicks();
      client.emit('market:snapshot', ticks);

      // Send top signals
      this.signalsService.getActiveSignals().then(signals => client.emit('signals:update', signals.slice(0, 10)));

      console.log(`WS Client connected: ${client.id} (user: ${payload.sub})`);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.authenticatedClients.delete(client.id);
    console.log(`WS Client disconnected: ${client.id}`);
  }

  // ─── Market Subscriptions ─────────────────────────────────────────────────

  @SubscribeMessage('market:subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { marketId: string },
  ) {
    const clientData = this.authenticatedClients.get(client.id);
    if (!clientData) return;

    clientData.subscriptions.add(data.marketId);
    const tick = this.marketsService.getPriceTick(data.marketId);
    if (tick) client.emit('market:tick', tick);
    client.emit('market:subscribed', { marketId: data.marketId });
  }

  @SubscribeMessage('market:unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { marketId: string },
  ) {
    const clientData = this.authenticatedClients.get(client.id);
    if (!clientData) return;
    clientData.subscriptions.delete(data.marketId);
  }

  @SubscribeMessage('market:subscribe:all')
  handleSubscribeAll(@ConnectedSocket() client: Socket) {
    const clientData = this.authenticatedClients.get(client.id);
    if (!clientData) return;
    const markets = this.marketsService.getAllMarkets();
    markets.forEach(m => clientData.subscriptions.add(m.id));
    client.emit('market:subscribed:all', { count: markets.length });
  }

  // ─── Real-time Price Broadcasting ─────────────────────────────────────────

  @Interval(400)
  broadcastPrices() {
    if (this.authenticatedClients.size === 0) return;

    const allTicks = this.marketsService.getAllTicks();

    for (const [clientId, clientData] of this.authenticatedClients.entries()) {
      const client = this.server.sockets.sockets.get(clientId);
      if (!client) continue;

      // Send ticks for subscribed markets only (or all if subscribed to all)
      const ticks = allTicks.filter(t => clientData.subscriptions.has(t.marketId));
      if (ticks.length > 0) {
        client.emit('market:ticks', ticks);
      }
    }
  }

  @Interval(15000)
  async broadcastSignals() {
    if (this.authenticatedClients.size === 0) return;
    const signals = await this.signalsService.getActiveSignals();
    this.server.emit('signals:update', signals);
  }

  // ─── Trade Notifications (called by TradingService) ───────────────────────

  notifyTradeOpened(userId: string, trade: any) {
    this.emitToUser(userId, 'trade:opened', trade);
  }

  notifyTradeClosed(userId: string, trade: any) {
    this.emitToUser(userId, 'trade:closed', trade);
  }

  notifyBalanceUpdate(userId: string, balance: number, demoBalance: number) {
    this.emitToUser(userId, 'balance:update', { balance, demoBalance });
  }

  private emitToUser(userId: string, event: string, data: any) {
    for (const [clientId, clientData] of this.authenticatedClients.entries()) {
      if (clientData.userId === userId) {
        const client = this.server.sockets.sockets.get(clientId);
        client?.emit(event, data);
      }
    }
  }

  // ─── Admin Broadcast ──────────────────────────────────────────────────────

  broadcastAnnouncement(message: string, type: 'info' | 'warning' | 'promo' = 'info') {
    this.server.emit('announcement', { message, type, timestamp: new Date() });
  }
}
