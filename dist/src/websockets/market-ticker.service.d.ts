import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MarketStreamService } from '../market-data/market-stream.service';
import { LatencyMetricsService } from '../monitoring/latency-metrics.service';
import { MarketGateway } from './market.gateway';
export declare class MarketTickerService implements OnModuleInit, OnModuleDestroy {
    private readonly marketStreamService;
    private readonly marketGateway;
    private readonly metrics;
    private unsubscribe;
    constructor(marketStreamService: MarketStreamService, marketGateway: MarketGateway, metrics: LatencyMetricsService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private broadcast;
}
