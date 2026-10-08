import { PayoutEngineConfig } from './payout-engine.config';

/**
 * Market-condition measurement and the pricing/risk model that turns it into
 * a target payout. Pure functions: the inputs are candles and counters the
 * price engine really produced, so the same inputs always give the same
 * target.
 *
 * The model
 * ---------
 * Each asset starts from its baseline payout (its calibrated payout for a
 * 60-second trade). Four measured risk factors move the target away from it:
 *
 *   volatility  4.0 pp per unit of (short-term vol / hourly vol - 1)
 *   range       2.0 pp per unit of (recent M1 range / hourly M1 range - 1)
 *   trend       3.0 pp at full trend efficiency (above the 0.15 a random
 *               walk typically shows over the window)
 *   regime      3.0 pp per unit of (share of time in HIGH_VOLATILITY or
 *               BREAKOUT generation regimes - its expected share of 0.3)
 *
 * Each ratio is clipped to [-0.5, 1.5] before weighting, the total is capped
 * at maxRiskReductionPercent below the baseline and maxStabilityBonusPercent
 * above it, and the result is clipped to [minPercent, maxPercent]. Calmer
 * than usual conditions can therefore raise a payout a little; unusually
 * volatile, trending or stressed conditions lower it. Volatility is one input
 * among several, not the whole answer.
 *
 * Ratios compare an asset with its own recent past, so every asset is priced
 * on its own behaviour and assets do not move in lockstep.
 *
 * Synthetic OTC markets have no order book: liquidity and volume are reported
 * as unavailable rather than invented.
 */

export type CandleSample = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type RegimeSample = {
  /** Generation decisions counted since the last evaluation. */
  decisions: number;
  /** Of those, decisions in HIGH_VOLATILITY or BREAKOUT. */
  stressed: number;
  /** Of those, decisions in TREND_UP, TREND_DOWN or BREAKOUT. */
  trending: number;
  /** Regime the generator is in right now. */
  current: string | null;
};

export type DataQuality = 'OK' | 'INSUFFICIENT' | 'STALE';

export type MarketConditionMetrics = {
  source: 'OTC_SYNTHETIC_ENGINE' | 'REAL_MARKET_FEED';
  measuredAt: string;
  dataQuality: DataQuality;
  s5Samples: number;
  m1Samples: number;
  lastTickAgeMs: number | null;
  shortVolatility: number;
  longVolatility: number;
  volatilityRatio: number;
  movementIntensity: number;
  shortRangePct: number;
  rangeRatio: number;
  trendStrength: number;
  reversalRate: number;
  stressedRegimeShare: number;
  trendingRegimeShare: number;
  currentRegime: string | null;
  /** Not available for synthetic markets; never fabricated. */
  liquidity: null;
  liquidityNote: string;
};

export type TargetComponents = {
  volatility: number;
  range: number;
  trend: number;
  regime: number;
};

export type PayoutTarget = {
  targetPercent: number;
  baselinePercent: number;
  components: TargetComponents;
};

/** 10 minutes of 5-second candles. */
export const SHORT_WINDOW_S5 = 120;
/** 60 minutes of 5-second candles. */
export const LONG_WINDOW_S5 = 720;
/** Fewer closed 5-second candles than this: too little data to judge. */
export const MIN_S5_SAMPLES = SHORT_WINDOW_S5;
/** No tick for this long: the feed is stale. */
export const STALE_TICK_MS = 15_000;
const SHORT_WINDOW_M1 = 10;
const MIN_M1_FOR_RANGE = 20;

const WEIGHTS = { volatility: 4, range: 2, trend: 3, regime: 3 };
const NEUTRAL_TREND_EFFICIENCY = 0.15;
const EXPECTED_STRESSED_SHARE = 0.3;
// A regime counter needs at least this many decisions (~1 minute) to count.
const MIN_REGIME_DECISIONS = 300;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function stdev(values: number[]) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function logReturns(candles: CandleSample[]) {
  const returns: number[] = [];
  for (let index = 1; index < candles.length; index += 1) {
    const previous = candles[index - 1].close;
    const current = candles[index].close;
    if (previous > 0 && current > 0) returns.push(Math.log(current / previous));
  }
  return returns;
}

function averageRangePct(candles: CandleSample[]) {
  if (candles.length === 0) return 0;
  let total = 0;
  for (const candle of candles) {
    total += candle.close > 0 ? (candle.high - candle.low) / candle.close : 0;
  }
  return total / candles.length;
}

function round(value: number, digits = 6) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
}

export function measureMarketConditions(input: {
  /** Closed 5-second candles, oldest first. */
  s5: CandleSample[];
  /** Closed 1-minute candles, oldest first. */
  m1: CandleSample[];
  regime: RegimeSample;
  now: number;
  lastTickAt: number | null;
  source?: MarketConditionMetrics['source'];
}): MarketConditionMetrics {
  const longS5 = input.s5.slice(-LONG_WINDOW_S5);
  const shortS5 = longS5.slice(-SHORT_WINDOW_S5);
  const longReturns = logReturns(longS5);
  const shortReturns = logReturns(shortS5);

  const shortVolatility = stdev(shortReturns);
  const longVolatility = stdev(longReturns);
  const volatilityRatio = longVolatility > 0 ? shortVolatility / longVolatility : 1;

  const longMeanAbs =
    longReturns.reduce((sum, value) => sum + Math.abs(value), 0) / Math.max(longReturns.length, 1);
  const shortAbsSum = shortReturns.reduce((sum, value) => sum + Math.abs(value), 0);
  const shortMeanAbs = shortAbsSum / Math.max(shortReturns.length, 1);
  const movementIntensity = longMeanAbs > 0 ? shortMeanAbs / longMeanAbs : 1;

  // Efficiency ratio: net move over total path. ~0 for chop, 1 for a
  // straight line.
  const trendStrength =
    shortAbsSum > 0
      ? Math.abs(shortReturns.reduce((sum, value) => sum + value, 0)) / shortAbsSum
      : 0;

  let reversals = 0;
  let moves = 0;
  let lastSign = 0;
  for (const value of shortReturns) {
    const sign = Math.sign(value);
    if (sign === 0) continue;
    if (lastSign !== 0) {
      moves += 1;
      if (sign !== lastSign) reversals += 1;
    }
    lastSign = sign;
  }
  const reversalRate = moves > 0 ? reversals / moves : 0;

  const m1 = input.m1.slice(-60);
  const shortRangePct = averageRangePct(m1.slice(-SHORT_WINDOW_M1));
  const longRangePct = averageRangePct(m1);
  const rangeRatio =
    m1.length >= MIN_M1_FOR_RANGE && longRangePct > 0 ? shortRangePct / longRangePct : 1;

  const regimeKnown = input.regime.decisions >= MIN_REGIME_DECISIONS;
  const stressedRegimeShare = regimeKnown
    ? input.regime.stressed / input.regime.decisions
    : EXPECTED_STRESSED_SHARE;
  const trendingRegimeShare = regimeKnown ? input.regime.trending / input.regime.decisions : 0;

  const lastTickAgeMs = input.lastTickAt === null ? null : Math.max(0, input.now - input.lastTickAt);
  const dataQuality: DataQuality =
    lastTickAgeMs === null || lastTickAgeMs > STALE_TICK_MS
      ? 'STALE'
      : input.s5.length < MIN_S5_SAMPLES
      ? 'INSUFFICIENT'
      : 'OK';

  return {
    source: input.source ?? 'OTC_SYNTHETIC_ENGINE',
    measuredAt: new Date(input.now).toISOString(),
    dataQuality,
    s5Samples: longS5.length,
    m1Samples: m1.length,
    lastTickAgeMs,
    shortVolatility: round(shortVolatility, 10),
    longVolatility: round(longVolatility, 10),
    volatilityRatio: round(volatilityRatio, 4),
    movementIntensity: round(movementIntensity, 4),
    shortRangePct: round(shortRangePct, 8),
    rangeRatio: round(rangeRatio, 4),
    trendStrength: round(trendStrength, 4),
    reversalRate: round(reversalRate, 4),
    stressedRegimeShare: round(stressedRegimeShare, 4),
    trendingRegimeShare: round(trendingRegimeShare, 4),
    currentRegime: input.regime.current,
    liquidity: null,
    liquidityNote:
      input.source === 'REAL_MARKET_FEED'
        ? 'Liquidity not supplied by the market-data provider.'
        : 'Synthetic OTC market: no order book, so no liquidity or volume data.',
  };
}

/**
 * Target payout for one asset, or null when the data is not good enough to
 * justify any change (the published payout is then simply held).
 */
export function computeTargetPayout(
  metrics: MarketConditionMetrics,
  baselinePercent: number,
  config: PayoutEngineConfig,
): PayoutTarget | null {
  if (metrics.dataQuality !== 'OK') return null;

  const volatility = WEIGHTS.volatility * clamp(metrics.volatilityRatio - 1, -0.5, 1.5);
  const range = WEIGHTS.range * clamp(metrics.rangeRatio - 1, -0.5, 1.5);
  const trend =
    WEIGHTS.trend *
    clamp(
      (metrics.trendStrength - NEUTRAL_TREND_EFFICIENCY) / (1 - NEUTRAL_TREND_EFFICIENCY),
      0,
      1,
    );
  const regime =
    WEIGHTS.regime * clamp(metrics.stressedRegimeShare - EXPECTED_STRESSED_SHARE, -0.3, 0.7);

  const risk = volatility + range + trend + regime;
  const adjustment = clamp(-risk, -config.maxRiskReductionPercent, config.maxStabilityBonusPercent);
  const targetPercent = clamp(baselinePercent + adjustment, config.minPercent, config.maxPercent);

  return {
    targetPercent: round(targetPercent, 4),
    baselinePercent,
    components: {
      volatility: round(-volatility, 4),
      range: round(-range, 4),
      trend: round(-trend, 4),
      regime: round(-regime, 4),
    },
  };
}

/** Plain-language summary of what drove a target, for the audit trail. */
export function describeTarget(target: PayoutTarget) {
  const parts = Object.entries(target.components)
    .filter(([, value]) => Math.abs(value) >= 0.25)
    .sort((left, right) => Math.abs(right[1]) - Math.abs(left[1]))
    .map(([name, value]) => `${name} ${value > 0 ? '+' : ''}${value.toFixed(2)}pp`);
  return parts.length ? parts.join(', ') : 'conditions near normal';
}
