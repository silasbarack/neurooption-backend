import { TradingEngineService } from './trading-engine.service';
import { PlaceTradeDto } from './dto/place-trade.dto';
import { AccountCurrency, AccountType } from './trading-engine.types';
export declare class TradingEngineController {
    private readonly tradingEngineService;
    constructor(tradingEngineService: TradingEngineService);
    placeTrade(dto: PlaceTradeDto): {
        trade: import("./trading-engine.types").PlacedTrade;
        wallet: {
            userId: string;
            accountType: AccountType;
            currency: AccountCurrency;
            balanceUsd: number;
            balance: number;
            updatedAt: string;
        };
    };
    settleTrade(tradeId: string): {
        trade: import("./trading-engine.types").PlacedTrade;
        wallet: {
            userId: string;
            accountType: AccountType;
            currency: AccountCurrency;
            balanceUsd: number;
            balance: number;
            updatedAt: string;
        };
    };
    getOpenTrades(userId?: string): import("./trading-engine.types").PlacedTrade[];
    getTradeHistory(userId?: string): import("./trading-engine.types").PlacedTrade[];
    getAllTrades(userId?: string): import("./trading-engine.types").PlacedTrade[];
    getWallet(userId?: string, accountType?: AccountType, currency?: AccountCurrency): {
        userId: string;
        accountType: AccountType;
        currency: AccountCurrency;
        balanceUsd: number;
        balance: number;
        updatedAt: string;
    };
    getTransactions(userId?: string): import("../transactions/transactions.service").TransactionRecord[];
}
