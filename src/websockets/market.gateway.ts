import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { MARKET_ASSETS } from '../market-data/market-data.constants';
import { MarketDataService } from '../market-data/market-data.service';
import {
  isSupportedTimeframe,
  normalizeTimeframe,
} from '../market-data/timeframe.config';
import { LatencyMetricsService } from '../monitoring/latency-metrics.service';
import {
  AssetPayoutUpdate,
  PayoutEngineService,
} from '../payout-engine/payout-engine.service';
import { WebsocketEvents } from './websockets-events';

const MAX_SUBSCRIPTIONS_PER_SOCKET = 12;

export type MarketPriceUpdate = {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  time: number;
  timestamp: number;
  sequence: number;
  source: string;
  marketType: 'OTC' | 'REAL';
  serverReceiveTimestamp: number;
  serverBroadcastTimestamp: number;
  serverTime: string;
};

export type MarketCandleUpdate = {
  symbol: string;
  timeframe: string;
  sequence: number;
  serverBroadcastTimestamp: number;
  candle: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closed: boolean;
  };
};

@WebSocketGateway({
  namespace: 'market',
  cors: {
    origin: process.env.WEBSOCKET_ORIGIN
      ? process.env.WEBSOCKET_ORIGIN.split(',').map((value) => value.trim())
      : '*',
  },
  pingInterval: 10_000,
  pingTimeout: 5_000,
  maxHttpBufferSize: 100_000,
})
export class MarketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Namespace;

  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly metrics: LatencyMetricsService,
    private readonly payoutEngine: PayoutEngineService,
  ) {}

  handleConnection(client: Socket) {
    this.metrics.setCounter(
      'active_websocket_connections',
      this.server.sockets.size,
    );

    const serverTimestamp = Date.now();
    client.emit(WebsocketEvents.CONNECTED, {
      message: 'Connected to NeuroOption market websocket',
      socketId: client.id,
      protocolVersion: 2,
      serverTimestamp,
      serverTime: new Date(serverTimestamp).toISOString(),
    });
    // Every (re)connection starts from the current payouts, so an update
    // missed while disconnected never leaves a stale payout on screen.
    client.emit(WebsocketEvents.ASSET_PAYOUT_SNAPSHOT, {
      serverTimestamp,
      payouts: this.payoutEngine.listSnapshots(),
    });
  }

  handleDisconnect() {
    this.metrics.setCounter(
      'active_websocket_connections',
      this.server.sockets.size,
    );
  }

  @SubscribeMessage(WebsocketEvents.SUBSCRIBE_SYMBOL)
  subscribeSymbol(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { symbol: string; timeframe?: string },
  ) {
    const symbol = this.normalizeSymbol(data?.symbol);
    const timeframe = data?.timeframe
      ? normalizeTimeframe(data.timeframe)
      : undefined;

    const marketRooms = Array.from(client.rooms).filter(
      (room) => room.startsWith('symbol:') || room.startsWith('chart:'),
    );

    if (marketRooms.length >= MAX_SUBSCRIPTIONS_PER_SOCKET) {
      return {
        event: WebsocketEvents.ERROR,
        message: 'Too many market subscriptions.',
      };
    }

    client.join(this.symbolRoom(symbol));
    if (timeframe) client.join(this.chartRoom(symbol, timeframe));

    const tick = this.marketDataService.getTick(symbol);
    return {
      event: WebsocketEvents.SUBSCRIBE_SYMBOL,
      symbol,
      timeframe,
      sequence: Number(tick.sequence ?? 0),
      serverTimestamp: Date.now(),
    };
  }

  @SubscribeMessage(WebsocketEvents.UNSUBSCRIBE_SYMBOL)
  unsubscribeSymbol(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { symbol: string; timeframe?: string },
  ) {
    const symbol = this.normalizeSymbol(data?.symbol);
    client.leave(this.symbolRoom(symbol));

    if (data?.timeframe && isSupportedTimeframe(data.timeframe.toUpperCase())) {
      client.leave(this.chartRoom(symbol, data.timeframe.toUpperCase()));
    }

    return {
      event: WebsocketEvents.UNSUBSCRIBE_SYMBOL,
      symbol,
      serverTimestamp: Date.now(),
    };
  }

  @SubscribeMessage(WebsocketEvents.SERVER_TIME)
  serverTime(@MessageBody() data: { clientSentAt?: number } = {}) {
    const serverTimestamp = Date.now();
    return {
      event: WebsocketEvents.SERVER_TIME,
      clientSentAt: Number(data?.clientSentAt ?? 0),
      serverTimestamp,
      serverTime: new Date(serverTimestamp).toISOString(),
    };
  }

  @SubscribeMessage(WebsocketEvents.RESYNC_REQUEST)
  async resync(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      symbol: string;
      timeframe: string;
      since?: number;
      limit?: number;
      lastSequence?: number;
    },
  ) {
    if (!this.allowEvent(client, 'resync', 750)) {
      return {
        event: WebsocketEvents.ERROR,
        message: 'Resync requests are rate limited.',
      };
    }

    this.metrics.increment('resync_requests');
    const symbol = this.normalizeSymbol(data?.symbol);
    const timeframe = normalizeTimeframe(data?.timeframe);
    const result = await this.marketDataService.getCandles({
      asset: symbol,
      timeframe,
      limit: Math.min(Math.max(Number(data?.limit ?? 320), 60), 420),
    });

    return {
      event: WebsocketEvents.RESYNC_RESPONSE,
      symbol,
      timeframe,
      requestedSince: Number(data?.since ?? 0),
      lastSequence: Number(
        this.marketDataService.getTick(symbol).sequence ?? 0,
      ),
      serverTimestamp: Date.now(),
      candles: result.candles.filter(
        (candle) => !data?.since || candle.time >= Number(data.since),
      ),
    };
  }

  @SubscribeMessage(WebsocketEvents.CLIENT_METRICS)
  clientMetrics(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      tickAgeMs?: number;
      renderDelayMs?: number;
      reconnect?: boolean;
      transport?: string;
    },
  ) {
    if (!this.allowEvent(client, 'metrics', 1_000)) {
      return { ok: false, rateLimited: true, serverTimestamp: Date.now() };
    }

    const tickAgeMs = Number(data?.tickAgeMs);
    const renderDelayMs = Number(data?.renderDelayMs);

    if (Number.isFinite(tickAgeMs) && tickAgeMs >= 0 && tickAgeMs < 60_000) {
      this.metrics.observe('client_tick_age_ms', tickAgeMs);
    }
    if (
      Number.isFinite(renderDelayMs) &&
      renderDelayMs >= 0 &&
      renderDelayMs < 60_000
    ) {
      this.metrics.observe('client_render_delay_ms', renderDelayMs);
    }
    if (data?.reconnect) this.metrics.increment('reconnect_count');
    if (typeof data?.transport === 'string') {
      this.metrics.observeTransport(data.transport);
    }

    return { ok: true, serverTimestamp: Date.now() };
  }

  broadcastPriceUpdate(dto: MarketPriceUpdate) {
    this.server
      .to(this.symbolRoom(dto.symbol))
      .volatile.emit(WebsocketEvents.PRICE_UPDATE, dto);
  }

  broadcastCandleUpdate(dto: MarketCandleUpdate) {
    // Active-candle snapshots are state-bearing messages. Keep raw price ticks
    // volatile for freshness/backpressure, but deliver the current candle
    // reliably so mobile transports cannot remain visually frozen.
    this.server
      .to(this.chartRoom(dto.symbol, dto.timeframe))
      .emit(WebsocketEvents.CANDLE_UPDATE, dto);
  }

  /** Payout changes are rare and small, so every client gets them. */
  broadcastPayoutUpdate(update: AssetPayoutUpdate) {
    this.server?.emit(WebsocketEvents.ASSET_PAYOUT_UPDATED, update);
  }

  symbolRoom(symbol: string) {
    return `symbol:${symbol}`;
  }

  chartRoom(symbol: string, timeframe: string) {
    return `chart:${symbol}:${timeframe}`;
  }

  private watched = new Set<string>();
  private watchedCheckedAt = 0;

  /** Whether any client follows the symbol (price or chart room). */
  isWatched(symbol: string) {
    const now = Date.now();
    if (now - this.watchedCheckedAt > 250) {
      this.watchedCheckedAt = now;
      const next = new Set<string>();
      for (const room of this.server?.adapter?.rooms?.keys() ?? []) {
        if (room.startsWith('symbol:')) next.add(room.slice(7));
        else if (room.startsWith('chart:')) {
          next.add(room.slice(6, room.lastIndexOf(':')));
        }
      }
      this.watched = next;
    }
    return this.watched.has(symbol);
  }

  roomSize(room: string) {
    return this.server.adapter.rooms.get(room)?.size ?? 0;
  }

  private allowEvent(client: Socket, key: string, minIntervalMs: number) {
    const rateLimits =
      (client.data.marketRateLimits as Record<string, number> | undefined) ?? {};
    const now = Date.now();
    const previous = rateLimits[key] ?? 0;

    if (now - previous < minIntervalMs) return false;

    rateLimits[key] = now;
    client.data.marketRateLimits = rateLimits;
    return true;
  }

  private normalizeSymbol(value?: string) {
    const normalized = String(value ?? '').trim().toLowerCase();
    const asset = MARKET_ASSETS.find(
      (candidate) =>
        candidate.isActive && candidate.symbol.toLowerCase() === normalized,
    );

    if (!asset) {
      throw new Error('Unsupported or inactive market symbol.');
    }

    return asset.symbol;
  }
}
