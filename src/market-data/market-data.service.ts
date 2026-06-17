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

type AssetBehaviour = {
  trendPersistence: number;
  noiseStrength: number;
  wickStrength: number;
  meanReversion: number;
  impulseChance: number;
  impulseStrength: number;
  tickIntervalMs: number;
};

type MarketState = {
  asset: OtcAsset;
  timeframe: OtcTimeframe;
  candles: OtcCandle[];
  lastPrice: number;
  velocity: number;
  impulse: number;
  lastUpdate: number;
  currentCandleStart: number;
  behaviour: AssetBehaviour;
  seedOffset: number;
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

/**
 * 650ms gives moderate latency:
 * - not too fast
 * - not dead/static
 * - close to the visual feel of OTC terminals where candles update in steady ticks
 */
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

    const seedOffset = this.symbolSeed(symbol);
    const behaviour = this.createAssetBehaviour(asset, seedOffset);
    const candles = this.generateInitialCandles(asset, timeframe, behaviour, seedOffset, 120);
    const last = candles[candles.length - 1];

    const state: MarketState = {
      asset,
      timeframe,
      candles,
      lastPrice: last.close,
      velocity: this.randomNormal() * asset.volatility * 0.05,
      impulse: 0,
      lastUpdate: Date.now(),
      currentCandleStart: last.time,
      behaviour,
      seedOffset,
    };

    this.states.set(key, state);
    return state;
  }

  private generateInitialCandles(
    asset: OtcAsset,
    timeframe: OtcTimeframe,
    behaviour: AssetBehaviour,
    seedOffset: number,
    count: number,
  ): OtcCandle[] {
    const candles: OtcCandle[] = [];
    const durationMs = TIMEFRAME_SECONDS[timeframe] * 1000;
    const timeframeFactor = this.getTimeframeVolatilityFactor(timeframe);
    const volatility = asset.volatility * timeframeFactor;

    let price = asset.basePrice;
    let velocity = this.randomNormal() * volatility * 0.2;
    let regimeDirection = this.seededDirection(seedOffset);

    for (let index = 0; index < count; index += 1) {
      const time = Date.now() - (count - index) * durationMs;

      if (index % 18 === 0) {
        regimeDirection = this.randomNormal() >= 0 ? 1 : -1;
      }

      const regimeWave =
        Math.sin(index / (8 + (seedOffset % 7))) *
        volatility *
        0.42 *
        regimeDirection;

      velocity =
        velocity * behaviour.trendPersistence +
        this.randomNormal() * volatility * behaviour.noiseStrength +
        regimeWave * 0.16;

      const open = price;

      const bodyMove = velocity + this.randomNormal() * volatility * 0.22;
      const close = Math.max(0.00000001, open + bodyMove);

      const bodySize = Math.abs(close - open);
      const wickBase = Math.max(bodySize * 0.35, volatility * 0.22);

      const upperWick =
        Math.abs(this.randomNormal()) *
        wickBase *
        behaviour.wickStrength *
        (close >= open ? 0.85 : 1.18);

      const lowerWick =
        Math.abs(this.randomNormal()) *
        wickBase *
        behaviour.wickStrength *
        (close >= open ? 1.18 : 0.85);

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

    const deltaSeconds = Math.min(1.4, Math.max(0.25, (now - state.lastUpdate) / 1000));
    const durationMs = TIMEFRAME_SECONDS[state.timeframe] * 1000;
    const timeframeFactor = this.getTimeframeVolatilityFactor(state.timeframe);
    const volatility = state.asset.volatility * timeframeFactor;

    const elapsedInCandle = Math.max(0, now - state.currentCandleStart);
    const candleProgress = Math.min(1, elapsedInCandle / durationMs);

    /*
      Realistic OTC style:
      - small directional continuation
      - occasional soft impulse
      - mean reversion to prevent impossible runaway movement
      - candle body and wick evolve naturally from tick movement
    */
    if (Math.random() < state.behaviour.impulseChance) {
      state.impulse =
        this.randomNormal() *
        volatility *
        state.behaviour.impulseStrength *
        (0.6 + candleProgress);
    }

    state.impulse *= 0.86;

    const meanPull =
      (state.asset.basePrice - state.lastPrice) *
      state.behaviour.meanReversion;

    const slowWave =
      Math.sin(now / (4200 + state.seedOffset * 11)) *
      volatility *
      0.025;

    const mediumWave =
      Math.sin(now / (1700 + state.seedOffset * 5)) *
      volatility *
      0.018;

    const marketNoise =
      this.randomNormal() *
      volatility *
      state.behaviour.noiseStrength *
      0.18;

    state.velocity =
      state.velocity * state.behaviour.trendPersistence +
      marketNoise +
      slowWave +
      mediumWave +
      state.impulse * 0.12 +
      meanPull;

    const movement = state.velocity * Math.sqrt(deltaSeconds);

    const maxTickMove = volatility * 0.34;
    const controlledMovement = this.clamp(movement, -maxTickMove, maxTickMove);

    const nextPrice = Math.max(0.00000001, state.lastPrice + controlledMovement);

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

      /*
        Slightly reset velocity at candle open so new candles don't look like
        one continuous artificial line. This gives realistic FX candle changes.
      */
      state.velocity *= 0.55;
      state.impulse *= 0.35;
    }
  }

  private createAssetBehaviour(asset: OtcAsset, seedOffset: number): AssetBehaviour {
    const personality = (seedOffset % 10) / 10;

    if (asset.category === "Currencies") {
      return {
        trendPersistence: 0.91 + personality * 0.025,
        noiseStrength: 0.55 + personality * 0.12,
        wickStrength: 1.0 + personality * 0.22,
        meanReversion: 0.000055,
        impulseChance: 0.018 + personality * 0.006,
        impulseStrength: 0.72 + personality * 0.18,
        tickIntervalMs: ENGINE_INTERVAL_MS,
      };
    }

    if (asset.category === "Cryptocurrencies") {
      return {
        trendPersistence: 0.88 + personality * 0.035,
        noiseStrength: 0.72 + personality * 0.2,
        wickStrength: 1.25 + personality * 0.35,
        meanReversion: 0.000045,
        impulseChance: 0.026 + personality * 0.012,
        impulseStrength: 0.9 + personality * 0.35,
        tickIntervalMs: ENGINE_INTERVAL_MS,
      };
    }

    if (asset.category === "Indices") {
      return {
        trendPersistence: 0.92 + personality * 0.03,
        noiseStrength: 0.5 + personality * 0.16,
        wickStrength: 0.92 + personality * 0.24,
        meanReversion: 0.000038,
        impulseChance: 0.015 + personality * 0.006,
        impulseStrength: 0.6 + personality * 0.22,
        tickIntervalMs: ENGINE_INTERVAL_MS,
      };
    }

    if (asset.category === "Stocks") {
      return {
        trendPersistence: 0.89 + personality * 0.04,
        noiseStrength: 0.62 + personality * 0.18,
        wickStrength: 1.08 + personality * 0.26,
        meanReversion: 0.00005,
        impulseChance: 0.02 + personality * 0.01,
        impulseStrength: 0.8 + personality * 0.28,
        tickIntervalMs: ENGINE_INTERVAL_MS,
      };
    }

    return {
      trendPersistence: 0.9 + personality * 0.03,
      noiseStrength: 0.58 + personality * 0.16,
      wickStrength: 1.18 + personality * 0.25,
      meanReversion: 0.000045,
      impulseChance: 0.019 + personality * 0.008,
      impulseStrength: 0.72 + personality * 0.24,
      tickIntervalMs: ENGINE_INTERVAL_MS,
    };
  }

  private getTimeframeVolatilityFactor(timeframe: OtcTimeframe): number {
    const seconds = TIMEFRAME_SECONDS[timeframe];

    /*
      Higher timeframes should have bigger candles, but not absurd movement.
      sqrt scaling is realistic for aggregated market movement.
    */
    return Math.min(3.4, Math.sqrt(seconds / 60));
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

  private symbolSeed(symbol: string): number {
    let hash = 0;

    for (let index = 0; index < symbol.length; index += 1) {
      hash = (hash * 31 + symbol.charCodeAt(index)) >>> 0;
    }

    return hash % 997;
  }

  private seededDirection(seed: number): 1 | -1 {
    return seed % 2 === 0 ? 1 : -1;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private randomNormal(): number {
    return Math.random() + Math.random() + Math.random() + Math.random() - 2;
  }
}