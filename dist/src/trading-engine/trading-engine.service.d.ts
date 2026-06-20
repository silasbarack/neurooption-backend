import { PrismaService } from '../config/prisma.service';
import { MarketDataService } from '../market-data/market-data.service';
type AccountTypeValue = 'QT_DEMO' | 'QT_REAL';
type TradeSideValue = 'BUY' | 'SELL';
type AccountCurrencyValue = 'USD' | 'KES' | 'UGX' | 'TZS' | 'NGN' | 'XOF' | 'EUR' | 'CAD' | 'JPY' | 'CNY' | 'AOA' | 'ZAR' | 'BRL';
type OpenTradeDto = {
    userId?: string;
    assetSymbol: string;
    assetLabel?: string;
    timeframe?: string;
    side: TradeSideValue;
    accountType: AccountTypeValue | 'QT Demo' | 'QT Real';
    currency: AccountCurrencyValue;
    stake: number;
    payout: number;
    expirySeconds: number;
};
type GetTradesDto = {
    userId?: string;
    accountType?: AccountTypeValue | 'QT Demo' | 'QT Real';
    currency?: AccountCurrencyValue;
    limit?: string;
};
export declare class TradingEngineService {
    private readonly prisma;
    private readonly marketDataService;
    constructor(prisma: PrismaService, marketDataService: MarketDataService);
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
    openTrade(dto: OpenTradeDto): Promise<{
        message: string;
        userId: any;
        trade: {
            id: any;
            userId: any;
            walletId: any;
            assetSymbol: any;
            assetLabel: any;
            timeframe: any;
            side: any;
            status: any;
            accountType: any;
            currency: any;
            stake: number;
            stakeUsd: number;
            payout: number;
            expectedProfit: number;
            expectedReturn: number;
            entryPrice: number;
            closePrice: number;
            openedAt: any;
            expiresAt: any;
            closedAt: any;
            profitAmount: number;
            returnAmount: number;
            metadata: any;
        };
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
    private settleSingleTrade;
    private getLatestBackendPrice;
    private resolveUserId;
    private ensureWallet;
    private ensureWalletTx;
    private normalizeAccountType;
    private normalizeCurrency;
    private normalizeSide;
    private clampExpiry;
    private parseLimit;
    private mergeMetadata;
    private formatWallet;
    private formatTrade;
}
export {};
