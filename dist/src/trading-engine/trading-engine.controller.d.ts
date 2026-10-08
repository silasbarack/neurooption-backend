import type { Request } from 'express';
import { TradingEngineService } from './trading-engine.service';
import { PlaceTradeDto } from './dto/place-trade.dto';
import { AccountCurrency, AccountType } from './trading-engine.types';
export declare const GUEST_USER_ID = "demo-user";
type MaybeAuthenticatedRequest = Request & {
    user?: {
        id: string;
    };
};
export declare class TradingEngineController {
    private readonly tradingEngineService;
    constructor(tradingEngineService: TradingEngineService);
    placeTrade(req: MaybeAuthenticatedRequest, dto: PlaceTradeDto): Promise<{
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
    settleTrade(req: MaybeAuthenticatedRequest, tradeId: string): Promise<{
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
    getOpenTrades(req: MaybeAuthenticatedRequest): Promise<import("./trading-engine.types").PlacedTrade[]>;
    getTradeHistory(req: MaybeAuthenticatedRequest): Promise<import("./trading-engine.types").PlacedTrade[]>;
    getAllTrades(req: MaybeAuthenticatedRequest): Promise<import("./trading-engine.types").PlacedTrade[]>;
    getWallet(req: MaybeAuthenticatedRequest, accountType?: AccountType, currency?: AccountCurrency): Promise<{
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
    topUpDemo(req: MaybeAuthenticatedRequest, amount: number, currency?: AccountCurrency): Promise<{
        message: string;
        addedUsd: number;
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
    getTransactions(req: MaybeAuthenticatedRequest): Promise<{
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
export {};
