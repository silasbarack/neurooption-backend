import { Injectable, MessageEvent, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Observable } from "rxjs";
import { MARKET_ASSETS } from "./market-assets";
import type {
  MarketCategory,
  OtcAsset,
  OtcCandle,
  OtcStreamPayload,
  OtcTimeframe,
} from "./market-data.types";

type MarketState = {
  asset: OtcAsset;
  timeframe: OtcTimeframe;
  candles: OtcCandle[];
  lastPrice: number;
  trend: number;
  lastUpdate: number;
  currentCandleStart: number;
};

const TIMEFRAME_SECONDS: Record<OtcTimeframe, number> = {
  M1: 60,
  M2: 120,
  M3: 180,
  M5: 300,
  M15: 900,
  M30: 1800,
  H1: 3600,
  H4: 14400,
};

const ENGINE_INTERVAL_MS = 650;

@Injectable()
export class MarketDataService implements OnModuleInit, OnModuleDestroy {
  private readonly states = new Map<string, MarketState>();
  private engineTimer: ReturnType<typeof setInterval> | null = null;

  onModuleInit() {
    this.engineTimer = setInterval(() => {
      this.states.forEach((state) => this.advanceState(state));
    }, ENGINE_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.engineTimer) {
      clearInterval(this.engineTimer);
    }
  }

  getAssets(category?: MarketCategory): OtcAsset[] {
    if (!category) return MARKET_ASSETS;
    return MARKET_ASSETS.filter((asset) => asset.category === category);
  }

  getCandles(symbol: string, timeframe: OtcTimeframe, limit = 120): OtcCandle[] {
    const state = this.getOrCreateState(symbol, timeframe);
    return state.candles.slice(-limit);
  }

  stream(symbol: string, timeframe: OtcTimeframe): Observable<MessageEvent> {
    const state = this.getOrCreateState(symbol, timeframe);

    return new Observable<MessageEvent>((subscriber) => {
      subscriber.next({
        type: "snapshot",
        data: this.toPayload(state, "snapshot"),
      });

      const timer = setInterval(() => {
        subscriber.next({
          type: "tick",
          data: this.toPayload(state, "tick"),
        });
      }, ENGINE_INTERVAL_MS);

      return () => {
        clearInterval(timer);
      };
    });
  }

  private getOrCreateState(symbol: string, timeframe: OtcTimeframe): MarketState {
    const asset = MARKET_ASSETS.find((item) => item.symbol === symbol);

    if (!asset) {
      throw new Error(`Unknown OTC asset: ${symbol}`);
    }

    const key = `${symbol}:${timeframe}`;
    const existing = this.states.get(key);

    if (existing) return existing;

    const candles = this.generateInitialCandles(asset, timeframe, 120);
    const last = candles[candles.length - 1];

    const state: MarketState = {
      asset,
      timeframe,
      candles,
      lastPrice: last.close,
      trend: this.randomNormal() * asset.volatility * 0.05,
      lastUpdate: Date.now(),
      currentCandleStart: last.time,
    };

    this.states.set(key, state);
    return state;
  }

  private generateInitialCandles(asset: OtcAsset, timeframe: OtcTimeframe, count: number): OtcCandle[] {
    const candles: OtcCandle[] = [];
    const durationMs = TIMEFRAME_SECONDS[timeframe] * 1000;
    const timeframeFactor = this.getTimeframeVolatilityFactor(timeframe);
    const volatility = asset.volatility * timeframeFactor;

    let price = asset.basePrice;
    let trend = this.randomNormal() * volatility * 0.15;

    for (let index = 0; index < count; index += 1) {
      const time = Date.now() - (count - index) * durationMs;

      trend = trend * 0.82 + this.randomNormal() * volatility * 0.18;

      const open = price;
      const bodyMove = trend + this.randomNormal() * volatility * 0.38;
      const close = Math.max(0.00000001, open + bodyMove);

      const upperWick = Math.abs(this.randomNormal()) * volatility * 0.55;
      const lowerWick = Math.abs(this.randomNormal()) * volatility * 0.55;

      const high = Math.max(open, close) + upperWick;
      const low = Math.max(0.00000001, Math.min(open, close) - lowerWick);

      candles.push({
        symbol: asset.symbol,
        timeframe,
        time,
        open,
        high,
        low,
        close,
        closed: true,
      });

      price = close;
    }

    candles[candles.length - 1].closed = false;
    return candles;
  }

  private advanceState(state: MarketState): void {
    const now = Date.now();
    const active = state.candles[state.candles.length - 1];

    if (!active) return;

    const deltaSeconds = Math.min(1.2, Math.max(0.2, (now - state.lastUpdate) / 1000));
    const durationMs = TIMEFRAME_SECONDS[state.timeframe] * 1000;

    const timeframeFactor = this.getTimeframeVolatilityFactor(state.timeframe);
    const volatility = state.asset.volatility * timeframeFactor;

    const meanPull = (state.asset.basePrice - state.lastPrice) * 0.00008;
    const softPulse = Math.sin(now / 2600) * volatility * 0.025;
    const smallNoise = this.randomNormal() * volatility * 0.13;

    state.trend = state.trend * 0.9 + this.randomNormal() * volatility * 0.055;

    const movement = (state.trend * 0.16 + meanPull + softPulse + smallNoise) * Math.sqrt(deltaSeconds);

    const nextPrice = Math.max(0.00000001, state.lastPrice + movement);

    state.lastPrice = nextPrice;
    state.lastUpdate = now;

    active.close = nextPrice;
    active.high = Math.max(active.high, nextPrice);
    active.low = Math.min(active.low, nextPrice);

    if (now - state.currentCandleStart >= durationMs) {
      active.closed = true;

      const newOpen = state.lastPrice;

      state.candles.push({
        symbol: state.asset.symbol,
        timeframe: state.timeframe,
        time: now,
        open: newOpen,
        high: newOpen,
        low: newOpen,
        close: newOpen,
        closed: false,
      });

      if (state.candles.length > 140) {
        state.candles.shift();
      }

      state.currentCandleStart = now;
    }
  }

  private getTimeframeVolatilityFactor(timeframe: OtcTimeframe): number {
    const seconds = TIMEFRAME_SECONDS[timeframe];
    return Math.min(3.8, Math.sqrt(seconds / 60));
  }

  private toPayload(state: MarketState, type: "snapshot" | "tick"): OtcStreamPayload {
    return {
      type,
      asset: state.asset,
      timeframe: state.timeframe,
      price: state.lastPrice,
      serverTime: Date.now(),
      candles: state.candles.slice(-120),
    };
  }

  private randomNormal(): number {
    return Math.random() + Math.random() + Math.random() + Math.random() - 2;
  }
}