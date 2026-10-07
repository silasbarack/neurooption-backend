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

// Polled at roughly one display frame. Each asset makes a move decision every
// 100 ms and delivers bigger moves as sub-ticks on the polls in between; an
// asset with nothing due is skipped, so idle polls cost almost nothing.
const STREAM_INTERVAL_MS = 33;

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

    if (cached && Date.now() - cached.serverReceiveTimestamp <= 500) {
      return cached;
    }

    return this.generateTick(symbol);
  }

  getCandleAggregator() {
    return this.candleAggregator;
  }

  private tickAll() {
    const loopStart = performance.now();

    const now = Date.now();

    for (const asset of MARKET_ASSETS) {
      if (!asset.isActive) continue;
      if (!this.otcEngine.isDue(asset.symbol, now)) continue;

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
