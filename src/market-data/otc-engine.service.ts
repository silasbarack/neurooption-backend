import { Injectable } from '@nestjs/common';
import { M1_CANDLE_MS, MarketAsset } from './market-data.constants';

type SeedAsset = MarketAsset;

export type GeneratedCandle = {
  open: number;
  high: number;
  low: number;
  close: number;
  openTime: Date;
  closeTime: Date;
};

type RandomState = {
  seed: number;
};

@Injectable()
export class OtcEngineService {
  generateCandle(
    asset: SeedAsset,
    previousClose: number,
    openTime: Date,
    progress = 1,
  ): GeneratedCandle {
    const safeProgress = this.clamp(progress, 0.01, 1);
    const state: RandomState = {
      seed: this.hashString(`${asset.symbol}-${openTime.toISOString()}`),
    };

    const baseVolatility = this.getBaseVolatility(asset);
    const regime = this.getRegime(state);
    const ticks = Math.max(1, Math.floor(120 * safeProgress));

    const fairValue = this.getFairValue(asset, openTime.getTime());
    const drift = this.getRegimeDrift(baseVolatility, regime);

    let open = previousClose;
    let close = previousClose;
    let high = previousClose;
    let low = previousClose;
    let momentum = 0;
    let volatility = baseVolatility;

    for (let tick = 0; tick < ticks; tick += 1) {
      const shock = Math.abs(this.randomNormal(state));
      const targetVolatility = baseVolatility * (0.65 + shock * 0.28);

      volatility = volatility * 0.94 + targetVolatility * 0.06;
      volatility = this.clamp(
        volatility,
        baseVolatility * 0.4,
        baseVolatility * 2.25,
      );

      const noise = this.randomNormal(state) * volatility * 0.34;
      const reversion = (fairValue - close) * 0.0012;

      momentum = momentum * 0.9 + (drift + noise) * 0.1;

      close = Math.max(0.00001, close + drift + noise + momentum + reversion);

      const body = Math.abs(close - open);
      const wickPulse = Math.abs(noise) * 0.78 + volatility * 0.22;

      high = Math.max(
        high,
        close + wickPulse * this.randomBetween(state, 0.2, 1.12),
        open + body * this.randomBetween(state, 0.04, 0.28),
      );

      low = Math.max(
        0.00001,
        Math.min(
          low,
          close - wickPulse * this.randomBetween(state, 0.2, 1.12),
          open - body * this.randomBetween(state, 0.04, 0.28),
        ),
      );
    }

    open = this.roundPrice(open, asset.precision);
    high = this.roundPrice(Math.max(open, high, close), asset.precision);
    low = this.roundPrice(Math.min(open, low, close), asset.precision);
    close = this.roundPrice(close, asset.precision);

    return {
      open,
      high,
      low,
      close,
      openTime,
      closeTime: new Date(openTime.getTime() + M1_CANDLE_MS),
    };
  }

  private getBaseVolatility(asset: SeedAsset) {
    if (asset.basePrice < 3) return asset.basePrice * 0.000075;
    if (asset.basePrice < 200) return asset.basePrice * 0.00011;
    if (asset.basePrice < 5000) return asset.basePrice * 0.00007;
    return asset.basePrice * 0.00005;
  }

  private getRegime(state: RandomState) {
    const roll = this.nextRandom(state);

    if (roll < 0.18) return 'TREND_UP';
    if (roll < 0.36) return 'TREND_DOWN';
    if (roll < 0.52) return 'RANGE';
    if (roll < 0.65) return 'PULLBACK_UP';
    if (roll < 0.78) return 'PULLBACK_DOWN';
    if (roll < 0.86) return 'BREAKOUT_UP';
    if (roll < 0.94) return 'BREAKOUT_DOWN';

    return 'CONSOLIDATION';
  }

  private getRegimeDrift(baseVolatility: number, regime: string) {
    if (regime === 'TREND_UP') return baseVolatility * 0.12;
    if (regime === 'TREND_DOWN') return -baseVolatility * 0.12;
    if (regime === 'PULLBACK_UP') return baseVolatility * 0.05;
    if (regime === 'PULLBACK_DOWN') return -baseVolatility * 0.05;
    if (regime === 'BREAKOUT_UP') return baseVolatility * 0.22;
    if (regime === 'BREAKOUT_DOWN') return -baseVolatility * 0.22;

    return 0;
  }

  private getFairValue(asset: SeedAsset, timeMs: number) {
    const slowWave = Math.sin(timeMs / 1_200_000) * asset.basePrice * 0.0014;
    const mediumWave = Math.sin(timeMs / 420_000) * asset.basePrice * 0.0007;

    return asset.basePrice + slowWave + mediumWave;
  }

  private hashString(value: string) {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  private nextRandom(state: RandomState) {
    let x = state.seed || 123456789;

    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;

    state.seed = x >>> 0;

    return (state.seed % 1_000_000) / 1_000_000;
  }

  private randomBetween(state: RandomState, min: number, max: number) {
    return min + (max - min) * this.nextRandom(state);
  }

  private randomNormal(state: RandomState) {
    const u1 = Math.max(this.nextRandom(state), 0.000001);
    const u2 = Math.max(this.nextRandom(state), 0.000001);

    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  private roundPrice(value: number, precision: number) {
    const decimals = Math.min(Math.max(precision + 2, 2), 10);
    return Number(value.toFixed(decimals));
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }
}