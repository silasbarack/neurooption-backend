/// <reference types="jest" />
import { CandleAggregatorService } from '../src/market-data/candle-aggregator.service';
import { MARKET_ASSETS } from '../src/market-data/market-data.constants';
import { OtcStreamEngineService } from '../src/market-data/otc-stream-engine.service';
import { TIMEFRAME_MS, timeframeBucketStart } from '../src/market-data/timeframe.config';
import { MarketConditionService } from '../src/payout-engine/market-condition.service';
import {
  DEFAULT_PAYOUT_ENGINE_CONFIG,
  expiryAdjustment,
  validatePayoutEngineConfig,
} from '../src/payout-engine/payout-engine.config';
import {
  AssetPayoutUpdate,
  PayoutEngineService,
  baselinePayout,
} from '../src/payout-engine/payout-engine.service';
import {
  CandleSample,
  MarketConditionMetrics,
  computeTargetPayout,
  measureMarketConditions,
} from '../src/payout-engine/payout-model';
import {
  SmoothingState,
  decidePayout,
  movementInLastHour,
  reviewPhaseMs,
} from '../src/payout-engine/payout-smoothing';

const config = DEFAULT_PAYOUT_ENGINE_CONFIG;
const MIN = 60_000;
const T0 = Date.UTC(2026, 9, 8, 7, 0, 0); // 10:00 EAT

function metrics(overrides: Partial<MarketConditionMetrics> = {}): MarketConditionMetrics {
  return {
    source: 'OTC_SYNTHETIC_ENGINE',
    measuredAt: new Date(T0).toISOString(),
    dataQuality: 'OK',
    s5Samples: 720,
    m1Samples: 60,
    lastTickAgeMs: 100,
    shortVolatility: 0.0001,
    longVolatility: 0.0001,
    volatilityRatio: 1,
    movementIntensity: 1,
    shortRangePct: 0.0002,
    rangeRatio: 1,
    trendStrength: 0.1,
    reversalRate: 0.5,
    stressedRegimeShare: 0.3,
    trendingRegimeShare: 0.3,
    currentRegime: 'RANGE',
    liquidity: null,
    liquidityNote: 'synthetic',
    ...overrides,
  };
}

/** Deterministic random walk candles with a chosen per-candle volatility. */
function walk(count: number, start: number, step: number, vol: (i: number) => number, seed = 1) {
  let x = seed;
  const rand = () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) / 0xffffffff) * 2 - 1;
  };
  const candles: CandleSample[] = [];
  let price = 1.1;
  for (let i = 0; i < count; i += 1) {
    const open = price;
    price = price * Math.exp(rand() * vol(i));
    candles.push({
      time: start + i * step,
      open,
      close: price,
      high: Math.max(open, price) * (1 + vol(i) / 4),
      low: Math.min(open, price) * (1 - vol(i) / 4),
    });
  }
  return candles;
}

describe('payout model', () => {
  it('holds the baseline when conditions are normal', () => {
    const target = computeTargetPayout(metrics(), 87, config);
    expect(target?.targetPercent).toBeCloseTo(87, 5);
  });

  it('lowers the target when short-term volatility rises and raises it when calm', () => {
    const volatile = computeTargetPayout(metrics({ volatilityRatio: 1.8, rangeRatio: 1.5 }), 87, config)!;
    const calm = computeTargetPayout(metrics({ volatilityRatio: 0.6, rangeRatio: 0.7, stressedRegimeShare: 0.1 }), 87, config)!;
    expect(volatile.targetPercent).toBeLessThan(85);
    expect(calm.targetPercent).toBeGreaterThan(87);
    expect(calm.targetPercent).toBeLessThanOrEqual(90);
  });

  it('does not let volatility alone decide: trend and regime also count', () => {
    const trending = computeTargetPayout(metrics({ trendStrength: 0.9 }), 87, config)!;
    const stressed = computeTargetPayout(metrics({ stressedRegimeShare: 0.8 }), 87, config)!;
    expect(trending.targetPercent).toBeLessThan(87);
    expect(stressed.targetPercent).toBeLessThan(87);
    expect(trending.components.volatility).toBeCloseTo(0, 10);
  });

  it('keeps every target within 20%-92%', () => {
    for (const baseline of [20, 50, 88, 92]) {
      for (const volatilityRatio of [0, 0.5, 1, 3, 50]) {
        const target = computeTargetPayout(
          metrics({ volatilityRatio, rangeRatio: volatilityRatio, trendStrength: 1, stressedRegimeShare: 1 }),
          baseline,
          config,
        )!;
        expect(target.targetPercent).toBeGreaterThanOrEqual(20);
        expect(target.targetPercent).toBeLessThanOrEqual(92);
      }
    }
  });

  it('refuses to target anything on stale or insufficient data', () => {
    expect(computeTargetPayout(metrics({ dataQuality: 'STALE' }), 87, config)).toBeNull();
    expect(computeTargetPayout(metrics({ dataQuality: 'INSUFFICIENT' }), 87, config)).toBeNull();
  });

  it('measures volatility, trend and quality from candles, and never invents liquidity', () => {
    const calm = walk(720, T0, 5000, () => 0.0001, 7);
    const spiky = walk(720, T0, 5000, (i) => (i > 600 ? 0.0004 : 0.0001), 7);
    const regime = { decisions: 600, stressed: 180, trending: 100, current: 'RANGE' };
    const now = T0 + 720 * 5000;
    const a = measureMarketConditions({ s5: calm, m1: [], regime, now, lastTickAt: now - 50 });
    const b = measureMarketConditions({ s5: spiky, m1: [], regime, now, lastTickAt: now - 50 });
    expect(a.dataQuality).toBe('OK');
    expect(a.volatilityRatio).toBeGreaterThan(0.7);
    expect(a.volatilityRatio).toBeLessThan(1.3);
    expect(b.volatilityRatio).toBeGreaterThan(1.8);
    expect(a.liquidity).toBeNull();
    expect(measureMarketConditions({ s5: calm, m1: [], regime, now, lastTickAt: now - 60_000 }).dataQuality).toBe('STALE');
    expect(measureMarketConditions({ s5: calm.slice(0, 50), m1: [], regime, now, lastTickAt: now }).dataQuality).toBe('INSUFFICIENT');
  });

  it('applies expiry adjustments by duration only', () => {
    expect(expiryAdjustment(5)).toBe(-3);
    expect(expiryAdjustment(30)).toBe(-2);
    expect(expiryAdjustment(60)).toBe(0);
    expect(expiryAdjustment(300)).toBe(1);
  });

  it('rejects configurations that break the guarantees', () => {
    expect(() => validatePayoutEngineConfig({ ...config, minPercent: 95 })).toThrow();
    expect(() => validatePayoutEngineConfig({ ...config, maxHourlyMovementPercent: 1 })).toThrow();
  });
});

describe('payout smoothing', () => {
  const fresh = (displayed = 86): SmoothingState => ({
    displayed,
    smoothed: null,
    lastChangedAt: T0 - 60 * MIN,
    lastReviewedAt: T0 - 60 * MIN,
    changes: [],
  });

  it('never changes a payout under stable conditions', () => {
    let state = fresh(86);
    for (let t = 0; t < 6 * 60; t += 1) {
      const d = decidePayout(state, 86 + (t % 2 ? 0.3 : -0.3), T0 + t * MIN, 0, config);
      state = { ...state, smoothed: d.smoothed, lastReviewedAt: d.reviewed ? T0 + t * MIN : state.lastReviewedAt };
      expect(d.next).toBeNull();
    }
  });

  it('moves at most 2pp per review, 6pp per hour, at most every 10 minutes', () => {
    let state = fresh(88);
    const published: Array<{ at: number; value: number }> = [];
    for (let t = 0; t < 3 * 60; t += 1) {
      const now = T0 + t * MIN;
      const d = decidePayout(state, 70, now, 0, config);
      state = { ...state, smoothed: d.smoothed };
      if (d.reviewed) state.lastReviewedAt = now;
      if (d.next !== null) {
        expect(Math.abs(d.next - state.displayed)).toBeLessThanOrEqual(2);
        state = {
          ...state,
          displayed: d.next,
          lastChangedAt: now,
          changes: [...state.changes, { at: now, delta: d.next - state.displayed }],
        };
        published.push({ at: now, value: d.next });
        expect(movementInLastHour(state.changes, now)).toBeLessThanOrEqual(6);
      }
    }
    expect(published.length).toBeGreaterThan(3);
    for (let i = 1; i < published.length; i += 1) {
      expect(published[i].at - published[i - 1].at).toBeGreaterThanOrEqual(10 * MIN);
    }
    expect(published[published.length - 1].value).toBe(70);
  });

  it('respects the 20%-92% bounds and corrects an out-of-bounds payout', () => {
    const high = decidePayout(fresh(91), 99, T0, 0, config);
    expect(high.next).toBe(92);
    const above = decidePayout({ ...fresh(95), lastChangedAt: T0 }, null, T0, 0, config);
    expect(above.next).toBe(92);
    const low = decidePayout(fresh(21), 5, T0, 0, config);
    expect(low.next).toBe(20);
  });

  it('gives assets different review phases so they do not change together', () => {
    const phases = new Set(MARKET_ASSETS.map((asset) => reviewPhaseMs(asset.symbol, config)));
    expect(phases.size).toBeGreaterThanOrEqual(8);
  });
});

/** Conditions service driven by a scenario per asset. */
class ScenarioConditions {
  constructor(private readonly scenario: (symbol: string, now: number) => Partial<MarketConditionMetrics>) {}
  measure(symbol: string, now: number) {
    return metrics({ measuredAt: new Date(now).toISOString(), ...this.scenario(symbol, now) });
  }
}

function runEngine(engine: PayoutEngineService, minutes: number) {
  const updates: AssetPayoutUpdate[] = [];
  engine.subscribe((update) => updates.push(update));
  return (async () => {
    await engine.initialize(T0);
    for (let t = 0; t <= minutes; t += 1) await engine.runCycle(T0 + t * MIN);
    return updates;
  })();
}

describe('payout engine (memory mode)', () => {
  it('publishes nothing while every asset is stable', async () => {
    const engine = new PayoutEngineService(new ScenarioConditions(() => ({})) as unknown as MarketConditionService);
    const updates = await runEngine(engine, 180);
    expect(updates).toHaveLength(0);
    for (const asset of MARKET_ASSETS) {
      expect(engine.getSnapshot(asset.symbol)?.payoutPercent).toBe(baselinePayout(asset, config));
    }
  });

  it('prices each asset independently and within every limit', async () => {
    // Only crypto turns volatile; currencies calm down; everything else is normal.
    const engine = new PayoutEngineService(
      new ScenarioConditions((symbol) => {
        const asset = MARKET_ASSETS.find((item) => item.symbol === symbol)!;
        if (asset.category === 'Cryptocurrencies') return { volatilityRatio: 2.2, rangeRatio: 1.8 };
        if (asset.category === 'Currencies') return { volatilityRatio: 0.6, rangeRatio: 0.7, stressedRegimeShare: 0.1 };
        return {};
      }) as unknown as MarketConditionService,
    );
    const updates = await runEngine(engine, 120);

    const bySymbol = new Map<string, AssetPayoutUpdate[]>();
    for (const update of updates) {
      bySymbol.set(update.symbol, [...(bySymbol.get(update.symbol) ?? []), update]);
    }
    for (const asset of MARKET_ASSETS) {
      const list = bySymbol.get(asset.symbol) ?? [];
      const baseline = baselinePayout(asset, config);
      if (asset.category === 'Cryptocurrencies') expect(engine.getSnapshot(asset.symbol)!.payoutPercent).toBeLessThan(baseline);
      else if (asset.category === 'Currencies') expect(engine.getSnapshot(asset.symbol)!.payoutPercent).toBeGreaterThanOrEqual(Math.min(baseline + 1, 92));
      else expect(list).toHaveLength(0);

      let previousAt = 0;
      for (const update of list) {
        expect(Math.abs(update.payoutPercent - update.previousPercent!)).toBeLessThanOrEqual(2);
        expect(update.payoutPercent).toBeGreaterThanOrEqual(20);
        expect(update.payoutPercent).toBeLessThanOrEqual(92);
        const at = Date.parse(update.updatedAt);
        if (previousAt) expect(at - previousAt).toBeGreaterThanOrEqual(10 * MIN);
        previousAt = at;
        const hourMoves = list
          .filter((other) => Date.parse(other.updatedAt) > at - 60 * MIN && Date.parse(other.updatedAt) <= at)
          .reduce((sum, other) => sum + Math.abs(other.payoutPercent - other.previousPercent!), 0);
        expect(hourMoves).toBeLessThanOrEqual(6);
      }
      // Versions only ever go up by one per published change.
      list.forEach((update, index) => expect(update.version).toBe(2 + index));
    }

    // Changes are spread over the interval, not all published at one instant.
    const instants = new Set(updates.map((update) => update.updatedAt));
    expect(instants.size).toBeGreaterThan(3);
  });

  it('quotes depend only on asset and expiry, never on the trader', async () => {
    const engine = new PayoutEngineService(new ScenarioConditions(() => ({})) as unknown as MarketConditionService);
    // quote() takes no user, balance or trade history by design.
    expect(engine.quote.length).toBeLessThanOrEqual(3);
    const a = engine.quote('EUR/USD OTC', 60)!;
    const b = engine.quote('eur/usd otc', 60)!;
    expect(a.payoutPercent).toBe(b.payoutPercent);
    expect(engine.quote('EUR/USD OTC', 10)!.payoutPercent).toBe(a.payoutPercent - 3);
    expect(engine.quote('NOPE', 60)).toBeNull();
  });
});

describe('payout engine on the real OTC price pipeline', () => {
  it('measures each asset from the candles the generator really produced', () => {
    const otc = new OtcStreamEngineService();
    const aggregator = new CandleAggregatorService();
    const conditions = new MarketConditionService(aggregator, otc);
    const symbols = ['EUR/USD OTC', 'BTC/USD OTC', 'Gold OTC'].filter((symbol) =>
      MARKET_ASSETS.some((asset) => asset.symbol === symbol),
    );
    expect(symbols.length).toBeGreaterThanOrEqual(2);
    const start = timeframeBucketStart(T0, 'M1');
    const end = start + 65 * MIN;
    for (let time = start; time < end; time += 100) {
      for (const symbol of symbols) {
        const tick = otc.nextTick(symbol, time);
        aggregator.applyTick({ ...tick, serverReceiveTimestamp: time });
      }
    }
    const measured = symbols.map((symbol) => conditions.measure(symbol, end));
    for (const item of measured) {
      expect(item.dataQuality).toBe('OK');
      expect(item.source).toBe('OTC_SYNTHETIC_ENGINE');
      expect(item.liquidity).toBeNull();
      expect(item.volatilityRatio).toBeGreaterThan(0);
    }
    const targets = symbols.map((symbol, index) => {
      const asset = MARKET_ASSETS.find((item) => item.symbol === symbol)!;
      return computeTargetPayout(measured[index], baselinePayout(asset, config), config)!.targetPercent;
    });
    // Independent measurements: assets do not share one number.
    expect(new Set(measured.map((item) => item.volatilityRatio)).size).toBe(symbols.length);
    targets.forEach((target) => {
      expect(target).toBeGreaterThanOrEqual(20);
      expect(target).toBeLessThanOrEqual(92);
    });
  });

  it('builds candles on genuine UTC buckets for every chart timeframe', () => {
    const instant = Date.UTC(2026, 9, 8, 20, 59, 58, 750); // 23:59:58 EAT
    for (const [timeframe, ms] of Object.entries(TIMEFRAME_MS)) {
      const bucket = timeframeBucketStart(instant, timeframe);
      expect(bucket % ms).toBe(0);
      expect(bucket).toBeLessThanOrEqual(instant);
      expect(instant - bucket).toBeLessThan(ms);
    }
    expect(timeframeBucketStart(instant, 'S15')).toBe(Date.UTC(2026, 9, 8, 20, 59, 45));
    expect(timeframeBucketStart(instant, 'M5')).toBe(Date.UTC(2026, 9, 8, 20, 55));
  });
});
