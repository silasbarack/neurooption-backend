import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MarketStreamEvent, MarketStreamService } from '../market-data/market-stream.service';
import { LatencyMetricsService } from '../monitoring/latency-metrics.service';
import { MarketGateway } from './market.gateway';
import { PayoutEngineService } from '../payout-engine/payout-engine.service';

@Injectable()
export class MarketTickerService implements OnModuleInit, OnModuleDestroy {
  private unsubscribe: (() => void) | null = null;
  private unsubscribePayouts: (() => void) | null = null;

  constructor(
    private readonly marketStreamService: MarketStreamService,
    private readonly marketGateway: MarketGateway,
    private readonly metrics: LatencyMetricsService,
    private readonly payoutEngine: PayoutEngineService,
  ) {}

  onModuleInit() {
    this.marketStreamService.setWatchedSymbols((symbol) =>
      this.marketGateway.isWatched(symbol),
    );
    this.unsubscribe = this.marketStreamService.subscribe((event) =>
      this.broadcast(event),
    );
    this.unsubscribePayouts = this.payoutEngine.subscribe((update) =>
      this.marketGateway.broadcastPayoutUpdate(update),
    );
  }

  onModuleDestroy() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.unsubscribePayouts?.();
    this.unsubscribePayouts = null;
  }

  private broadcast(event: MarketStreamEvent) {
    const { tick, candleUpdates } = event;
    const symbolRoom = this.marketGateway.symbolRoom(tick.symbol);

    if (this.marketGateway.roomSize(symbolRoom) > 0) {
      const serverBroadcastTimestamp = Date.now();

      this.marketGateway.broadcastPriceUpdate({
        symbol: tick.symbol,
        price: tick.mid,
        bid: tick.bid,
        ask: tick.ask,
        time: tick.timestamp,
        timestamp: tick.timestamp,
        sequence: tick.sequence,
        source: tick.source,
        marketType: tick.marketType,
        serverReceiveTimestamp: tick.serverReceiveTimestamp,
        serverBroadcastTimestamp,
        serverTime: new Date(serverBroadcastTimestamp).toISOString(),
      });

      this.metrics.observe(
        'websocket_broadcast_latency_ms',
        Math.max(0, serverBroadcastTimestamp - tick.serverReceiveTimestamp),
      );
    }

    for (const update of candleUpdates) {
      const chartRoom = this.marketGateway.chartRoom(
        update.symbol,
        update.timeframe,
      );

      if (this.marketGateway.roomSize(chartRoom) === 0) continue;

      this.marketGateway.broadcastCandleUpdate({
        symbol: update.symbol,
        timeframe: update.timeframe,
        sequence: tick.sequence,
        serverBroadcastTimestamp: Date.now(),
        candle: {
          time: update.candle.time,
          open: update.candle.open,
          high: update.candle.high,
          low: update.candle.low,
          close: update.candle.close,
          volume: update.candle.volume,
          closed: update.candle.closed,
        },
      });
    }
  }
}
