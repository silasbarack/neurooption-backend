import { Injectable } from '@nestjs/common';
import { NormalizedMarketTick } from './market-tick.types';
import {
  MarketTimeframe,
  SUPPORTED_TIMEFRAMES,
  TIMEFRAME_MS,
  timeframeBucketStart,
} from './timeframe.config';

export type AggregatedCandle = {
  time: number;
  openTime: string;
  closeTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  firstSequence: number;
  lastSequence: number;
  closed: boolean;
};

export type CandleUpdate = {
  symbol: string;
  timeframe: MarketTimeframe;
  candle: AggregatedCandle;
};

const MAX_HISTORY_PER_STREAM = 720;
const OUT_OF_ORDER_TOLERANCE_MS = 1_500;

@Injectable()
export class CandleAggregatorService {
  private readonly active = new Map<string, AggregatedCandle>();
  private readonly history = new Map<string, AggregatedCandle[]>();
  private readonly lastSequence = new Map<string, number>();
  private readonly lastTimestamp = new Map<string, number>();

  applyTick(tick: NormalizedMarketTick): {
    updates: CandleUpdate[];
    duplicate: boolean;
    outOfOrder: boolean;
    sequenceGap: number;
  } {
    const previousSequence = this.lastSequence.get(tick.symbol);
    const previousTimestamp = this.lastTimestamp.get(tick.symbol);

    if (previousSequence !== undefined && tick.sequence <= previousSequence) {
      return {
        updates: [],
        duplicate: true,
        outOfOrder: tick.sequence < previousSequence,
        sequenceGap: 0,
      };
    }

    if (
      previousTimestamp !== undefined &&
      tick.timestamp + OUT_OF_ORDER_TOLERANCE_MS < previousTimestamp
    ) {
      return {
        updates: [],
        duplicate: false,
        outOfOrder: true,
        sequenceGap: 0,
      };
    }

    const sequenceGap =
      previousSequence === undefined
        ? 0
        : Math.max(0, tick.sequence - previousSequence - 1);

    this.lastSequence.set(tick.symbol, tick.sequence);
    this.lastTimestamp.set(
      tick.symbol,
      Math.max(previousTimestamp ?? tick.timestamp, tick.timestamp),
    );

    const updates: CandleUpdate[] = [];

    for (const timeframe of SUPPORTED_TIMEFRAMES) {
      const key = this.key(tick.symbol, timeframe);
      const bucketStart = timeframeBucketStart(tick.timestamp, timeframe);
      const current = this.active.get(key);

      if (!current || bucketStart > current.time) {
        if (current) {
          this.archive(key, { ...current, closed: true });
        }

        const next = this.createCandle(
          timeframe,
          bucketStart,
          tick.mid,
          tick.sequence,
        );

        this.active.set(key, next);
        updates.push({ symbol: tick.symbol, timeframe, candle: { ...next } });
        continue;
      }

      if (bucketStart < current.time) {
        continue;
      }

      current.high = Math.max(current.high, tick.mid);
      current.low = Math.min(current.low, tick.mid);
      current.close = tick.mid;
      current.volume += 1;
      current.lastSequence = tick.sequence;

      updates.push({ symbol: tick.symbol, timeframe, candle: { ...current } });
    }

    return { updates, duplicate: false, outOfOrder: false, sequenceGap };
  }

  getCurrentCandle(
    symbol: string,
    timeframe: MarketTimeframe | string,
  ): AggregatedCandle | undefined {
    const normalized = timeframe.toUpperCase() as MarketTimeframe;
    const candle = this.active.get(this.key(symbol, normalized));
    return candle ? { ...candle } : undefined;
  }

  getRecentCandles(
    symbol: string,
    timeframe: MarketTimeframe | string,
    limit = 300,
  ): AggregatedCandle[] {
    const normalized = timeframe.toUpperCase() as MarketTimeframe;
    const key = this.key(symbol, normalized);
    const archived = this.history.get(key) ?? [];
    const active = this.active.get(key);
    const combined = active ? [...archived, active] : archived;

    return combined.slice(-Math.max(1, limit)).map((candle) => ({ ...candle }));
  }

  getLastSequence(symbol: string) {
    return this.lastSequence.get(symbol) ?? 0;
  }

  private createCandle(
    timeframe: MarketTimeframe,
    bucketStart: number,
    price: number,
    sequence: number,
  ): AggregatedCandle {
    const close = bucketStart + TIMEFRAME_MS[timeframe];

    return {
      time: bucketStart,
      openTime: new Date(bucketStart).toISOString(),
      closeTime: new Date(close).toISOString(),
      open: price,
      high: price,
      low: price,
      close: price,
      volume: 1,
      firstSequence: sequence,
      lastSequence: sequence,
      closed: false,
    };
  }

  private archive(key: string, candle: AggregatedCandle) {
    const candles = this.history.get(key) ?? [];
    candles.push(candle);

    if (candles.length > MAX_HISTORY_PER_STREAM) {
      candles.splice(0, candles.length - MAX_HISTORY_PER_STREAM);
    }

    this.history.set(key, candles);
  }

  private key(symbol: string, timeframe: MarketTimeframe) {
    return `${symbol}|${timeframe}`;
  }
}
