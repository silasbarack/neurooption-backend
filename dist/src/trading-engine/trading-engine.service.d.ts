import { CreateTradeDto, TradeDirection } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';
import { TradeStatus } from './dto/trade-result.dto';
export declare class TradingEngineService {
    private trades;
    createTrade(userId: string, dto: CreateTradeDto): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        userId: string;
        symbol: string;
        direction: TradeDirection;
        amount: number;
        expiry: string;
        timeframe: string;
        marketType: import("./dto/create-trade.dto").MarketType;
        entryPrice: number;
        status: TradeStatus;
        createdAt: Date;
        expiresAt: Date;
    }>;
    settleTrade(dto: SettleTradeDto): Promise<any>;
    getUserTrades(userId: string): Promise<any[]>;
    private getCurrentPrice;
    private calculateExpiry;
}
