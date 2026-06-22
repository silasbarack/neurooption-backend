import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MarketDataService } from '../market-data/market-data.service';
import { MarketGateway } from './market.gateway';
export declare class MarketTickerService implements OnModuleInit, OnModuleDestroy {
    private readonly marketDataService;
    private readonly marketGateway;
    private intervalHandle;
    constructor(marketDataService: MarketDataService, marketGateway: MarketGateway);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private tick;
}
