import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MarketStreamService } from '../market-data/market-stream.service';
import { LatencyMetricsService } from '../monitoring/latency-metrics.service';
import { MarketGateway } from './market.gateway';
import { PayoutEngineService } from '../payout-engine/payout-engine.service';
export declare class MarketTickerService implements OnModuleInit, OnModuleDestroy {
    private readonly marketStreamService;
    private readonly marketGateway;
    private readonly metrics;
    private readonly payoutEngine;
    private unsubscribe;
    private unsubscribePayouts;
    constructor(marketStreamService: MarketStreamService, marketGateway: MarketGateway, metrics: LatencyMetricsService, payoutEngine: PayoutEngineService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private broadcast;
}
