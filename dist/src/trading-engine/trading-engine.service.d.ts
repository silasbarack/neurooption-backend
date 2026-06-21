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
    placeTrade(dto: PlaceTradeDto): {
        trade: PlacedTrade;
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
        trade: PlacedTrade;
        wallet: {
            userId: string;
            accountType: AccountType;
            currency: AccountCurrency;
            balanceUsd: number;
            balance: number;
            updatedAt: string;
        };
    };
    getOpenTrades(userId?: string): PlacedTrade[];
    getTradeHistory(userId?: string): PlacedTrade[];
    getAllTrades(userId?: string): PlacedTrade[];
    getWallet(userId?: string, accountType?: AccountType, currency?: AccountCurrency): {
        userId: string;
        accountType: AccountType;
        currency: AccountCurrency;
        balanceUsd: number;
        balance: number;
        updatedAt: string;
    };
    getTransactions(userId?: string): import("../transactions/transactions.service").TransactionRecord[];
    private applySettlement;
    private calculateResultStatus;
    private calculatePayoutPercent;
    private scheduleSettlement;
    private clearSettlementTimer;
    private validateTradeInput;
    private findAsset;
    private createId;
}
