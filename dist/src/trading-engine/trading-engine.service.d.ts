import { MarketDataService } from '../market-data/market-data.service';
import { WalletsService } from '../wallets/wallets.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TradesService } from '../trades/trades.service';
import { PlaceTradeDto } from './dto/place-trade.dto';
import { AccountCurrency, AccountType, PlacedTrade } from './trading-engine.types';
export declare class TradingEngineService {
    private readonly marketDataService;
    private readonly walletsService;
    private readonly transactionsService;
    private readonly tradesService;
    private readonly settlementTimers;
    constructor(marketDataService: MarketDataService, walletsService: WalletsService, transactionsService: TransactionsService, tradesService: TradesService);
    placeTrade(dto: PlaceTradeDto): Promise<{
        trade: PlacedTrade;
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
        trade: PlacedTrade;
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
    getOpenTrades(userId?: string): Promise<PlacedTrade[]>;
    getTradeHistory(userId?: string): Promise<PlacedTrade[]>;
    getAllTrades(userId?: string): Promise<PlacedTrade[]>;
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
    settleExpiredTrades(userId?: string): Promise<{
        userId: string;
        settled: number;
    }>;
    private applySettlement;
    private calculateResultStatus;
    private calculatePayoutPercent;
    private scheduleSettlement;
    private clearSettlementTimer;
    private validateTradeInput;
    private findAsset;
}
