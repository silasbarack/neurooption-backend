"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STALE_TICK_MS = exports.MIN_S5_SAMPLES = exports.LONG_WINDOW_S5 = exports.SHORT_WINDOW_S5 = void 0;
exports.measureMarketConditions = measureMarketConditions;
exports.computeTargetPayout = computeTargetPayout;
exports.describeTarget = describeTarget;
exports.SHORT_WINDOW_S5 = 120;
exports.LONG_WINDOW_S5 = 720;
exports.MIN_S5_SAMPLES = exports.SHORT_WINDOW_S5;
exports.STALE_TICK_MS = 15_000;
const SHORT_WINDOW_M1 = 10;
const MIN_M1_FOR_RANGE = 20;
const WEIGHTS = { volatility: 4, range: 2, trend: 3, regime: 3 };
const NEUTRAL_TREND_EFFICIENCY = 0.15;
const EXPECTED_STRESSED_SHARE = 0.3;
const MIN_REGIME_DECISIONS = 300;
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function stdev(values) {
    if (values.length < 2)
        return 0;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
    return Math.sqrt(variance);
}
function logReturns(candles) {
    const returns = [];
    for (let index = 1; index < candles.length; index += 1) {
        const previous = candles[index - 1].close;
        const current = candles[index].close;
        if (previous > 0 && current > 0)
            returns.push(Math.log(current / previous));
    }
    return returns;
}
function averageRangePct(candles) {
    if (candles.length === 0)
        return 0;
    let total = 0;
    for (const candle of candles) {
        total += candle.close > 0 ? (candle.high - candle.low) / candle.close : 0;
    }
    return total / candles.length;
}
function round(value, digits = 6) {
    return Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;
}
function measureMarketConditions(input) {
    const longS5 = input.s5.slice(-exports.LONG_WINDOW_S5);
    const shortS5 = longS5.slice(-exports.SHORT_WINDOW_S5);
    const longReturns = logReturns(longS5);
    const shortReturns = logReturns(shortS5);
    const shortVolatility = stdev(shortReturns);
    const longVolatility = stdev(longReturns);
    const volatilityRatio = longVolatility > 0 ? shortVolatility / longVolatility : 1;
    const longMeanAbs = longReturns.reduce((sum, value) => sum + Math.abs(value), 0) / Math.max(longReturns.length, 1);
    const shortAbsSum = shortReturns.reduce((sum, value) => sum + Math.abs(value), 0);
    const shortMeanAbs = shortAbsSum / Math.max(shortReturns.length, 1);
    const movementIntensity = longMeanAbs > 0 ? shortMeanAbs / longMeanAbs : 1;
    const trendStrength = shortAbsSum > 0
        ? Math.abs(shortReturns.reduce((sum, value) => sum + value, 0)) / shortAbsSum
        : 0;
    let reversals = 0;
    let moves = 0;
    let lastSign = 0;
    for (const value of shortReturns) {
        const sign = Math.sign(value);
        if (sign === 0)
            continue;
        if (lastSign !== 0) {
            moves += 1;
            if (sign !== lastSign)
                reversals += 1;
        }
        lastSign = sign;
    }
    const reversalRate = moves > 0 ? reversals / moves : 0;
    const m1 = input.m1.slice(-60);
    const shortRangePct = averageRangePct(m1.slice(-SHORT_WINDOW_M1));
    const longRangePct = averageRangePct(m1);
    const rangeRatio = m1.length >= MIN_M1_FOR_RANGE && longRangePct > 0 ? shortRangePct / longRangePct : 1;
    const regimeKnown = input.regime.decisions >= MIN_REGIME_DECISIONS;
    const stressedRegimeShare = regimeKnown
        ? input.regime.stressed / input.regime.decisions
        : EXPECTED_STRESSED_SHARE;
    const trendingRegimeShare = regimeKnown ? input.regime.trending / input.regime.decisions : 0;
    const lastTickAgeMs = input.lastTickAt === null ? null : Math.max(0, input.now - input.lastTickAt);
    const dataQuality = lastTickAgeMs === null || lastTickAgeMs > exports.STALE_TICK_MS
        ? 'STALE'
        : input.s5.length < exports.MIN_S5_SAMPLES
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
        liquidityNote: input.source === 'REAL_MARKET_FEED'
            ? 'Liquidity not supplied by the market-data provider.'
            : 'Synthetic OTC market: no order book, so no liquidity or volume data.',
    };
}
function computeTargetPayout(metrics, baselinePercent, config) {
    if (metrics.dataQuality !== 'OK')
        return null;
    const volatility = WEIGHTS.volatility * clamp(metrics.volatilityRatio - 1, -0.5, 1.5);
    const range = WEIGHTS.range * clamp(metrics.rangeRatio - 1, -0.5, 1.5);
    const trend = WEIGHTS.trend *
        clamp((metrics.trendStrength - NEUTRAL_TREND_EFFICIENCY) / (1 - NEUTRAL_TREND_EFFICIENCY), 0, 1);
    const regime = WEIGHTS.regime * clamp(metrics.stressedRegimeShare - EXPECTED_STRESSED_SHARE, -0.3, 0.7);
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
function describeTarget(target) {
    const parts = Object.entries(target.components)
        .filter(([, value]) => Math.abs(value) >= 0.25)
        .sort((left, right) => Math.abs(right[1]) - Math.abs(left[1]))
        .map(([name, value]) => `${name} ${value > 0 ? '+' : ''}${value.toFixed(2)}pp`);
    return parts.length ? parts.join(', ') : 'conditions near normal';
}
//# sourceMappingURL=payout-model.js.map