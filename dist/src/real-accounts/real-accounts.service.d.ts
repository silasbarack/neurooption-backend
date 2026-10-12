import { AccountCurrency } from '@prisma/client';
import { SwitchAccountCurrencyDto } from '../trading-accounts/dto/switch-account-currency.dto';
import { TradingAccountsService } from '../trading-accounts/trading-accounts.service';
export declare class RealAccountsService {
    private readonly tradingAccountsService;
    constructor(tradingAccountsService: TradingAccountsService);
    create(userId: string, currency?: AccountCurrency): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
    }>;
    findByUser(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
    })[]>;
    switchCurrency(userId: string, dto: SwitchAccountCurrencyDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
        trades: {
            id: string;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            direction: import(".prisma/client").$Enums.TradeDirection;
            expiresAt: Date;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            openedAt: Date;
            closedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        type: import(".prisma/client").$Enums.AccountType;
    }>;
}
