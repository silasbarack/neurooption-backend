import { NormalizedMarketTick } from './market-tick.types';
import { MarketTimeframe } from './timeframe.config';
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
export declare class CandleAggregatorService {
    private readonly active;
    private readonly history;
    private readonly lastSequence;
    private readonly lastTimestamp;
    applyTick(tick: NormalizedMarketTick): {
        updates: CandleUpdate[];
        duplicate: boolean;
        outOfOrder: boolean;
        sequenceGap: number;
    };
    getCurrentCandle(symbol: string, timeframe: MarketTimeframe | string): AggregatedCandle | undefined;
    getRecentCandles(symbol: string, timeframe: MarketTimeframe | string, limit?: number): AggregatedCandle[];
    getLastSequence(symbol: string): number;
    private createCandle;
    private archive;
    private key;
}
