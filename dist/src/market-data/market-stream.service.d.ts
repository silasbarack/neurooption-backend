import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CandleAggregatorService, CandleUpdate } from './candle-aggregator.service';
import { NormalizedMarketTick } from './market-tick.types';
import { OtcStreamEngineService } from './otc-stream-engine.service';
import { LatencyMetricsService } from '../monitoring/latency-metrics.service';
export type MarketStreamEvent = {
    tick: NormalizedMarketTick;
    candleUpdates: CandleUpdate[];
};
type Listener = (event: MarketStreamEvent) => void;
export declare class MarketStreamService implements OnModuleInit, OnModuleDestroy {
    private readonly otcEngine;
    private readonly candleAggregator;
    private readonly metrics;
    private intervalHandle;
    private readonly listeners;
    private readonly latestTicks;
    constructor(otcEngine: OtcStreamEngineService, candleAggregator: CandleAggregatorService, metrics: LatencyMetricsService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    subscribe(listener: Listener): () => boolean;
    getLatestTick(symbol: string): NormalizedMarketTick;
    getCandleAggregator(): CandleAggregatorService;
    private tickAll;
    private generateTick;
}
export {};
