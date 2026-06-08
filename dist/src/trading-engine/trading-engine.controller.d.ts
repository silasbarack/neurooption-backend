import { TradingEngineService } from './trading-engine.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';
export declare class TradingEngineController {
    private readonly tradingEngineService;
    constructor(tradingEngineService: TradingEngineService);
    createTrade(userId: string, createTradeDto: CreateTradeDto): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        userId: string;
        symbol: string;
        direction: import("./dto/create-trade.dto").TradeDirection;
        amount: number;
        expiry: string;
        timeframe: string;
        marketType: import("./dto/create-trade.dto").MarketType;
        entryPrice: number;
        status: import("./dto/trade-result.dto").TradeStatus;
        createdAt: Date;
        expiresAt: Date;
    }>;
    settleTrade(settleTradeDto: SettleTradeDto): Promise<any>;
    getUserTrades(userId: string): Promise<any[]>;
}
