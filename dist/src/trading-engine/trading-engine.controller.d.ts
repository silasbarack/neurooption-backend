import { TradingEngineService } from './trading-engine.service';
import { OpenTradesDto } from './dto/open-trades.dto';
import { GetTradesDto } from './dto/get-trades.dto';
export declare class TradingEngineController {
    private readonly tradingEngineService;
    constructor(tradingEngineService: TradingEngineService);
    getWallet(query: GetTradesDto): Promise<{
        userId: any;
        wallet: {
            id: any;
            userId: any;
            accountType: any;
            currency: any;
            balance: number;
            balanceUsd: number;
            isActive: any;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    openTrade(body: OpenTradesDto): Promise<{
        userId: any;
        trades: any;
    }>;
    getOpenTrades(query: GetTradesDto): Promise<{
        userId: any;
        trades: any;
    }>;
    getTradeHistory(query: GetTradesDto): Promise<{
        userId: any;
        trades: any;
    }>;
    settleExpiredTrades(userId?: string): Promise<{
        settledCount: number;
        settled: any[];
    }>;
}
