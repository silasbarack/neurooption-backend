import { AccountCurrency } from '@prisma/client';
import { SwitchAccountCurrencyDto } from '../trading-accounts/dto/switch-account-currency.dto';
import { TradingAccountsService } from '../trading-accounts/trading-accounts.service';
export declare class RealAccountsService {
    private readonly tradingAccountsService;
    constructor(tradingAccountsService: TradingAccountsService);
    create(userId: string, currency?: AccountCurrency): Promise<{
        trades: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            expiresAt: Date;
            openedAt: Date;
            closedAt: Date | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
        }[];
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        type: import(".prisma/client").$Enums.AccountType;
    }>;
    findByUser(userId: string): Promise<({
        trades: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            expiresAt: Date;
            openedAt: Date;
            closedAt: Date | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
        }[];
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        type: import(".prisma/client").$Enums.AccountType;
    })[]>;
    switchCurrency(userId: string, dto: SwitchAccountCurrencyDto): Promise<{
        trades: {
            id: string;
            payoutRate: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.TradeStatus;
            userId: string;
            expiresAt: Date;
            openedAt: Date;
            closedAt: Date | null;
            stakeAmount: import("@prisma/client/runtime/library").Decimal;
            entryPrice: import("@prisma/client/runtime/library").Decimal;
            exitPrice: import("@prisma/client/runtime/library").Decimal | null;
            profitAmount: import("@prisma/client/runtime/library").Decimal;
            tradingAccountId: string | null;
            assetId: string;
            expiryId: string | null;
            direction: import(".prisma/client").$Enums.TradeDirection;
        }[];
        user: {
            id: string;
            email: string;
            phone: string;
            fullname: never;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        userId: string;
        type: import(".prisma/client").$Enums.AccountType;
    }>;
}
