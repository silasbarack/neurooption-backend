import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { MARKET_ASSETS } from './market-data.constants';
import { CandleAggregatorService, CandleUpdate } from './candle-aggregator.service';
import { NormalizedMarketTick } from './market-tick.types';
import { OtcStreamEngineService } from './otc-stream-engine.service';
import { LatencyMetricsService } from '../monitoring/latency-metrics.service';

export type MarketStreamEvent = {
  tick: NormalizedMarketTick;
  candleUpdates: CandleUpdate[];
};

type Listener = (event: MarketStreamEvent) => void;

const STREAM_INTERVAL_MS = 100;

@Injectable()
export class MarketStreamService implements OnModuleInit, OnModuleDestroy {
  private intervalHandle: NodeJS.Timeout | null = null;
  private readonly listeners = new Set<Listener>();
  private readonly latestTicks = new Map<string, NormalizedMarketTick>();

  constructor(
    private readonly otcEngine: OtcStreamEngineService,
    private readonly candleAggregator: CandleAggregatorService,
    private readonly metrics: LatencyMetricsService,
  ) {}

  onModuleInit() {
    this.tickAll();
    this.intervalHandle = setInterval(() => this.tickAll(), STREAM_INTERVAL_MS);
    this.intervalHandle.unref?.();
  }

  onModuleDestroy() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    this.listeners.clear();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getLatestTick(symbol: string): NormalizedMarketTick {
    const cached = this.latestTicks.get(symbol);
    if (cached) return cached;

    // Bootstrap reads can occur during module start-up before the first
    // interval pass. If that happens, route the bootstrap tick through the
    // same aggregation path so its sequence is never skipped.
    const tick = this.generateTick(symbol);
    const aggregation = this.candleAggregator.applyTick(tick);

    if (aggregation.sequenceGap > 0) {
      this.metrics.increment('sequence_gaps', aggregation.sequenceGap);
    }

    if (aggregation.duplicate || aggregation.outOfOrder) {
      this.metrics.increment('ticks_dropped');
    }

    return tick;
  }

  getCandleAggregator() {
    return this.candleAggregator;
  }

  private tickAll() {
    const loopStart = performance.now();

    for (const asset of MARKET_ASSETS) {
      if (!asset.isActive) continue;

      const tick = this.generateTick(asset.symbol);
      const aggregationStart = performance.now();
      const aggregation = this.candleAggregator.applyTick(tick);

      this.metrics.observe(
        'candle_aggregation_time_ms',
        performance.now() - aggregationStart,
      );

      if (aggregation.sequenceGap > 0) {
        this.metrics.increment('sequence_gaps', aggregation.sequenceGap);
      }

      if (aggregation.duplicate || aggregation.outOfOrder) {
        this.metrics.increment('ticks_dropped');
      }

      const event: MarketStreamEvent = {
        tick,
        candleUpdates: aggregation.updates,
      };

      for (const listener of this.listeners) {
        listener(event);
      }
    }

    const elapsed = performance.now() - loopStart;
    if (elapsed > STREAM_INTERVAL_MS) {
      this.metrics.increment('ticks_dropped');
    }
  }

  private generateTick(symbol: string): NormalizedMarketTick {
    const serverReceiveTimestamp = Date.now();
    const raw = this.otcEngine.nextTick(symbol, serverReceiveTimestamp);
    const tick: NormalizedMarketTick = {
      ...raw,
      serverReceiveTimestamp,
    };

    this.latestTicks.set(symbol, tick);
    this.metrics.markTick(serverReceiveTimestamp);
    this.metrics.observe(
      'market_data_ingest_latency_ms',
      Math.max(0, serverReceiveTimestamp - tick.timestamp),
    );

    return tick;
  }
}
