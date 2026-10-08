import { PayoutEngineConfig } from './payout-engine.config';
export type CandleSample = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
};
export type RegimeSample = {
    decisions: number;
    stressed: number;
    trending: number;
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
export declare const SHORT_WINDOW_S5 = 120;
export declare const LONG_WINDOW_S5 = 720;
export declare const MIN_S5_SAMPLES = 120;
export declare const STALE_TICK_MS = 15000;
export declare function measureMarketConditions(input: {
    s5: CandleSample[];
    m1: CandleSample[];
    regime: RegimeSample;
    now: number;
    lastTickAt: number | null;
    source?: MarketConditionMetrics['source'];
}): MarketConditionMetrics;
export declare function computeTargetPayout(metrics: MarketConditionMetrics, baselinePercent: number, config: PayoutEngineConfig): PayoutTarget | null;
export declare function describeTarget(target: PayoutTarget): string;
