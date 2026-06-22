import { TradingEngineService } from './trading-engine.service';
import { PlaceTradeDto } from './dto/place-trade.dto';
import { AccountCurrency, AccountType } from './trading-engine.types';
export declare class TradingEngineController {
    private readonly tradingEngineService;
    constructor(tradingEngineService: TradingEngineService);
    placeTrade(dto: PlaceTradeDto): Promise<{
        trade: import("./trading-engine.types").PlacedTrade;
        wallet: {
            id: any;
            userId: any;
            accountType: any;
            currency: any;
            balance: number;
            balanceUsd: number;
            locked: number;
            lockedUsd: number;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    settleTrade(tradeId: string): Promise<{
        trade: import("./trading-engine.types").PlacedTrade;
        wallet: {
            id: any;
            userId: any;
            accountType: any;
            currency: any;
            balance: number;
            balanceUsd: number;
            locked: number;
            lockedUsd: number;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    getOpenTrades(userId?: string): Promise<import("./trading-engine.types").PlacedTrade[]>;
    getTradeHistory(userId?: string): Promise<import("./trading-engine.types").PlacedTrade[]>;
    getAllTrades(userId?: string): Promise<import("./trading-engine.types").PlacedTrade[]>;
    getWallet(userId?: string, accountType?: AccountType, currency?: AccountCurrency): Promise<{
        id: any;
        userId: any;
        accountType: any;
        currency: any;
        balance: number;
        balanceUsd: number;
        locked: number;
        lockedUsd: number;
        createdAt: any;
        updatedAt: any;
    }>;
    getTransactions(userId?: string): Promise<{
        id: any;
        userId: any;
        walletId: any;
        tradeId: any;
        accountType: any;
        currency: any;
        type: any;
        status: any;
        amount: number;
        amountUsd: number;
        balanceAfter: number;
        balanceAfterUsd: number;
        description: any;
        reference: any;
        reason: any;
        metadata: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
}
