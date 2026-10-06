import { Injectable } from '@nestjs/common';
import { MARKET_ASSETS, MarketAsset } from './market-data.constants';
import { NormalizedMarketTick } from './market-tick.types';

type MicroRegime = 'UP' | 'DOWN' | 'RANGE' | 'RETRACE' | 'BURST';

type OtcRegime =
  | 'TREND_UP'
  | 'TREND_DOWN'
  | 'RANGE'
  | 'HIGH_VOLATILITY'
  | 'LOW_VOLATILITY'
  | 'BREAKOUT'
  | 'MEAN_REVERSION';

type OtcState = {
  price: number;
  velocity: number;
  volatility: number;
  trend: number;
  meanPrice: number;
  regime: OtcRegime;
  spread: number;
  ticksInRegime: number;
  regimeLength: number;
  seed: number;
  sequence: number;
  lastTimestamp: number;
  recentAbsoluteReturn: number;
  microRegime: MicroRegime;
  microDirection: -1 | 0 | 1;
  microTicksRemaining: number;
  microImpulseTicks: number;
  microAnchorPrice: number;
};

@Injectable()
export class OtcStreamEngineService {
  private readonly states = new Map<string, OtcState>();

  nextTick(symbol: string, now = Date.now()): Omit<
    NormalizedMarketTick,
    'serverReceiveTimestamp'
  > {
    const asset = this.findAsset(symbol);
    const state = this.getState(asset, now);
    const elapsedMs = Math.min(Math.max(now - state.lastTimestamp, 20), 1_000);
    const dtSeconds = elapsedMs / 1_000;
    const sqrtDt = Math.sqrt(dtSeconds);
    const tickSize = 10 ** -asset.precision;

    if (state.ticksInRegime >= state.regimeLength) {
      this.transitionRegime(state);
    }

    const baselineVolatility = this.baseTickVolatility(asset);
    const volatilityPersistence = 0.97;
    const volatilityResponse =
      asset.category === 'Currencies' ? 0.018 : 0.03;
    const targetVolatility =
      baselineVolatility *
      this.regimeVolatilityMultiplier(state.regime);

    state.volatility =
      volatilityPersistence * state.volatility +
      (1 - volatilityPersistence) * targetVolatility +
      volatilityResponse * state.recentAbsoluteReturn;

    state.volatility = this.clamp(
      state.volatility,
      baselineVolatility * 0.35,
      baselineVolatility *
        (asset.category === 'Currencies' ? 2.8 : 4.2),
    );

    const regimeDrift = this.regimeDrift(
      state.regime,
      state.volatility,
      state.trend,
    );
    const gaussian = this.randomNormal(state);
    const momentumNoise =
      gaussian * state.volatility * 0.045 * sqrtDt;

    state.velocity =
      state.velocity * this.regimePersistence(state.regime) +
      regimeDrift +
      momentumNoise;

    const maxVelocity =
      state.volatility *
      (asset.category === 'Currencies' ? 0.45 : 0.9);
    state.velocity = this.clamp(
      state.velocity,
      -maxVelocity,
      maxVelocity,
    );

    const meanReversionStrength =
      state.regime === 'MEAN_REVERSION'
        ? 0.006
        : state.regime === 'RANGE'
          ? 0.003
          : 0.0007;

    const meanReversion =
      ((state.meanPrice - state.price) / Math.max(state.price, 1e-9)) *
      meanReversionStrength;

    const anchorReversion =
      ((asset.basePrice - state.price) / Math.max(state.price, 1e-9)) *
      (asset.category === 'Currencies' ? 0.00012 : 0.00004);

    let shock = 0;
    const shockRoll = this.nextRandom(state);
    const shockThreshold =
      asset.category === 'Currencies' ? 0.9999 : 0.9997;

    if (shockRoll > shockThreshold) {
      const shockDirection = this.nextRandom(state) >= 0.5 ? 1 : -1;
      const shockMultiplier =
        state.regime === 'HIGH_VOLATILITY' || state.regime === 'BREAKOUT'
          ? asset.category === 'Currencies'
            ? 2.5
            : 4
          : asset.category === 'Currencies'
            ? 1.4
            : 2.2;

      shock = shockDirection * state.volatility * shockMultiplier;
    }

    const microReturn = this.microstructureReturn(
      state,
      asset,
      tickSize,
    );

    const rawLogReturn =
      state.velocity * dtSeconds +
      gaussian * state.volatility * sqrtDt +
      (meanReversion + anchorReversion) * dtSeconds +
      microReturn +
      shock;

    const maxTickReturn = this.maxTickLogReturn(asset);
    const logReturn = this.clamp(
      rawLogReturn,
      -maxTickReturn,
      maxTickReturn,
    );

    const previousPrice = state.price;
    state.price = Math.max(
      asset.basePrice * 0.05,
      state.price * Math.exp(logReturn),
    );

    const absoluteReturn = Math.abs(
      Math.log(state.price / Math.max(previousPrice, 1e-9)),
    );
    state.recentAbsoluteReturn =
      state.recentAbsoluteReturn * 0.9 + absoluteReturn * 0.1;

    state.meanPrice =
      state.meanPrice * 0.9995 + state.price * 0.0005;

    const spreadMultiplier =
      1 +
      this.clamp(
        state.volatility / Math.max(baselineVolatility, 1e-12) - 1,
        0,
        3,
      ) *
        0.22 +
      (state.regime === 'HIGH_VOLATILITY' || state.regime === 'BREAKOUT'
        ? 0.18
        : 0);

    const targetSpread = this.baseSpread(asset) * spreadMultiplier;
    state.spread = state.spread * 0.9 + targetSpread * 0.1;

    const roundedMid = this.roundToTick(state.price, tickSize);
    const roundedBid = this.roundToTick(
      roundedMid - state.spread / 2,
      tickSize,
    );
    const roundedAsk = this.roundToTick(
      roundedMid + state.spread / 2,
      tickSize,
    );

    state.sequence += 1;
    state.ticksInRegime += 1;
    state.lastTimestamp = now;

    return {
      symbol: asset.symbol,
      bid: roundedBid,
      ask: Math.max(roundedAsk, roundedBid + tickSize),
      mid: roundedMid,
      timestamp: now,
      sequence: state.sequence,
      source: 'neurooption-otc-simulator-v2',
      marketType: 'OTC',
    };
  }

  getLatestTick(symbol: string, now = Date.now()) {
    const asset = this.findAsset(symbol);
    const state = this.states.get(asset.symbol);

    if (!state || now - state.lastTimestamp >= 80) {
      return this.nextTick(asset.symbol, now);
    }

    const tickSize = 10 ** -asset.precision;
    const mid = this.roundToTick(state.price, tickSize);
    const bid = this.roundToTick(mid - state.spread / 2, tickSize);
    const ask = this.roundToTick(mid + state.spread / 2, tickSize);

    return {
      symbol: asset.symbol,
      bid,
      ask: Math.max(ask, bid + tickSize),
      mid,
      timestamp: state.lastTimestamp,
      sequence: state.sequence,
      source: 'neurooption-otc-simulator-v2',
      marketType: 'OTC' as const,
    };
  }

  private getState(asset: MarketAsset, now: number): OtcState {
    const existing = this.states.get(asset.symbol);
    if (existing) return existing;

    const seed = this.hashString(
      `${asset.symbol}:${Math.floor(now / 60_000)}`,
    );
    const state: OtcState = {
      price: asset.basePrice,
      velocity: 0,
      volatility: this.baseTickVolatility(asset),
      trend: 0,
      meanPrice: asset.basePrice,
      regime: 'RANGE',
      spread: this.baseSpread(asset),
      ticksInRegime: 0,
      regimeLength: 450,
      seed,
      sequence: 0,
      lastTimestamp: now - 100,
      recentAbsoluteReturn: 0,
      microRegime: 'RANGE',
      microDirection: 0,
      microTicksRemaining: 0,
      microImpulseTicks: 0,
      microAnchorPrice: asset.basePrice,
    };

    this.states.set(asset.symbol, state);
    this.transitionRegime(state);
    return state;
  }

  private transitionRegime(state: OtcState) {
    const previous = state.regime;
    const roll = this.nextRandom(state);

    const candidates: OtcRegime[] =
      previous === 'HIGH_VOLATILITY'
        ? ['RANGE', 'TREND_UP', 'TREND_DOWN', 'MEAN_REVERSION', 'LOW_VOLATILITY']
        : previous === 'BREAKOUT'
          ? ['TREND_UP', 'TREND_DOWN', 'HIGH_VOLATILITY', 'MEAN_REVERSION']
          : ['TREND_UP', 'TREND_DOWN', 'RANGE', 'HIGH_VOLATILITY', 'LOW_VOLATILITY', 'BREAKOUT', 'MEAN_REVERSION'];

    const index = Math.min(
      candidates.length - 1,
      Math.floor(roll * candidates.length),
    );

    state.regime = candidates[index];
    state.ticksInRegime = 0;
    state.regimeLength = Math.floor(180 + this.nextRandom(state) * 900);
    state.trend =
      state.regime === 'TREND_UP'
        ? 1
        : state.regime === 'TREND_DOWN'
          ? -1
          : state.regime === 'BREAKOUT'
            ? this.nextRandom(state) >= 0.5
              ? 1
              : -1
            : 0;

    if (state.regime === 'MEAN_REVERSION') {
      state.meanPrice = state.price;
    }
  }

  private microstructureReturn(
    state: OtcState,
    asset: MarketAsset,
    tickSize: number,
  ) {
    if (state.microTicksRemaining <= 0) {
      this.transitionMicroRegime(state);
    }

    state.microTicksRemaining -= 1;

    const price = Math.max(state.price, tickSize);
    const oneTickReturn = tickSize / price;
    const gaussian = this.randomNormal(state);
    const anchorDistanceTicks =
      (state.microAnchorPrice - state.price) / tickSize;

    let impulseTicks = 0;
    switch (state.microRegime) {
      case 'UP':
      case 'DOWN':
        impulseTicks =
          state.microDirection *
          (0.28 + Math.abs(gaussian) * 0.34);
        break;
      case 'RETRACE':
        impulseTicks =
          state.microDirection *
          (0.34 + Math.abs(gaussian) * 0.42);
        break;
      case 'BURST':
        impulseTicks =
          state.microDirection *
          (0.75 + Math.abs(gaussian) * 0.8);
        break;
      case 'RANGE':
      default:
        impulseTicks =
          gaussian * 0.32 +
          this.clamp(anchorDistanceTicks * 0.055, -0.38, 0.38);
        break;
    }

    // Small, rapidly mean-reverting order-flow memory creates frequent
    // one/two-tick changes without increasing long-horizon FX volatility.
    state.microImpulseTicks =
      state.microImpulseTicks * 0.42 + impulseTicks;

    const maxMicroTicks =
      asset.category === 'Currencies' ? 2.8 : 4.5;
    const boundedTicks = this.clamp(
      state.microImpulseTicks,
      -maxMicroTicks,
      maxMicroTicks,
    );

    return boundedTicks * oneTickReturn;
  }

  private transitionMicroRegime(state: OtcState) {
    const roll = this.nextRandom(state);
    const previousDirection = state.microDirection;

    if (roll < 0.26) {
      state.microRegime = 'RANGE';
      state.microDirection = 0;
      state.microTicksRemaining = 3 + Math.floor(this.nextRandom(state) * 7);
    } else if (roll < 0.47) {
      state.microRegime = 'UP';
      state.microDirection = 1;
      state.microTicksRemaining = 3 + Math.floor(this.nextRandom(state) * 10);
    } else if (roll < 0.68) {
      state.microRegime = 'DOWN';
      state.microDirection = -1;
      state.microTicksRemaining = 3 + Math.floor(this.nextRandom(state) * 10);
    } else if (roll < 0.9) {
      state.microRegime = 'RETRACE';
      state.microDirection =
        previousDirection === 0
          ? this.nextRandom(state) >= 0.5
            ? -1
            : 1
          : previousDirection === 1
            ? -1
            : 1;
      state.microTicksRemaining = 2 + Math.floor(this.nextRandom(state) * 6);
    } else {
      state.microRegime = 'BURST';
      state.microDirection = this.nextRandom(state) >= 0.5 ? 1 : -1;
      state.microTicksRemaining = 2 + Math.floor(this.nextRandom(state) * 4);
    }

    state.microAnchorPrice = state.price;
  }

  private regimeDrift(
    regime: OtcRegime,
    volatility: number,
    trend: number,
  ) {
    if (regime === 'TREND_UP') return volatility * 0.012;
    if (regime === 'TREND_DOWN') return -volatility * 0.012;
    if (regime === 'BREAKOUT') {
      return volatility * 0.028 * (trend === 0 ? 1 : trend);
    }
    return 0;
  }

  private regimePersistence(regime: OtcRegime) {
    if (regime === 'TREND_UP' || regime === 'TREND_DOWN') return 0.94;
    if (regime === 'BREAKOUT') return 0.9;
    if (regime === 'HIGH_VOLATILITY') return 0.78;
    if (regime === 'LOW_VOLATILITY') return 0.88;
    return 0.84;
  }

  private regimeVolatilityMultiplier(regime: OtcRegime) {
    if (regime === 'HIGH_VOLATILITY') return 2.25;
    if (regime === 'LOW_VOLATILITY') return 0.52;
    if (regime === 'BREAKOUT') return 1.8;
    if (regime === 'TREND_UP' || regime === 'TREND_DOWN') return 1.15;
    if (regime === 'MEAN_REVERSION') return 0.82;
    return 0.72;
  }

  private baseTickVolatility(asset: MarketAsset) {
    const categoryMultiplier =
      asset.category === 'Cryptocurrencies'
        ? 1.8
        : asset.category === 'Commodities'
          ? 1.3
          : asset.category === 'Indices'
            ? 1.15
            : asset.category === 'Stocks'
              ? 1.2
              : 1;

    return Math.max(asset.volatility * categoryMultiplier * 0.03, 1e-8);
  }

  private maxTickLogReturn(asset: MarketAsset) {
    if (asset.category === 'Currencies') return 0.00012;
    if (asset.category === 'Cryptocurrencies') return 0.0015;
    return 0.0008;
  }

  private baseSpread(asset: MarketAsset) {
    const tickSize = 10 ** -asset.precision;
    const ticks =
      asset.category === 'Currencies'
        ? asset.symbol.includes('JPY')
          ? 1.4
          : 1.8
        : asset.category === 'Cryptocurrencies'
          ? 5
          : 3;

    return tickSize * ticks;
  }

  private findAsset(symbol: string) {
    const normalized = symbol.trim().toLowerCase();
    const asset = MARKET_ASSETS.find(
      (item) =>
        item.isActive && item.symbol.toLowerCase() === normalized,
    );

    if (!asset) {
      throw new Error(`Unsupported or inactive OTC asset: ${symbol}`);
    }

    return asset;
  }

  private hashString(value: string) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  private nextRandom(state: OtcState) {
    let x = state.seed || 0x9e3779b9;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    state.seed = x >>> 0;
    return state.seed / 0xffffffff;
  }

  private randomNormal(state: OtcState) {
    const u1 = Math.max(this.nextRandom(state), 1e-9);
    const u2 = Math.max(this.nextRandom(state), 1e-9);
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  private roundToTick(value: number, tickSize: number) {
    return Number((Math.round(value / tickSize) * tickSize).toFixed(10));
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }
}
