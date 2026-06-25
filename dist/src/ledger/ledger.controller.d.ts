import { AccountCurrency } from '@prisma/client';
import { ConfirmDepositDto } from './dto/confirm-deposit.dto';
import { MarkWithdrawalPaidDto } from './dto/mark-withdrawal-paid.dto';
import { PlaceTradeDto } from './dto/place-trade.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { SettleTradeLostDto } from './dto/settle-trade-lost.dto';
import { SettleTradeWonDto } from './dto/settle-trade-won.dto';
import { LedgerService } from './ledger.service';
export declare class LedgerController {
    private readonly ledgerService;
    constructor(ledgerService: LedgerService);
    private assertCanReadUser;
    getBalance(req: any, userId: string, currency?: AccountCurrency): Promise<{
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        availableBalance: string;
    }>;
    getStatement(req: any, userId: string, currency?: AccountCurrency): Promise<{
        id: string;
        accountCode: import(".prisma/client").$Enums.LedgerAccountCode;
        side: import(".prisma/client").$Enums.LedgerEntrySide;
        amount: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        memo: string;
        transactionType: import(".prisma/client").$Enums.LedgerTransactionType;
        transactionDescription: string;
        createdAt: Date;
    }[]>;
    confirmDeposit(dto: ConfirmDepositDto): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
            accountId: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        userId: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        createdAt: Date;
        tradeId: string | null;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    requestWithdrawal(dto: RequestWithdrawalDto): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
            accountId: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        userId: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        createdAt: Date;
        tradeId: string | null;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    markWithdrawalPaid(dto: MarkWithdrawalPaidDto): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
            accountId: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        userId: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        createdAt: Date;
        tradeId: string | null;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    rejectWithdrawal(dto: RejectWithdrawalDto): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
            accountId: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        userId: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        createdAt: Date;
        tradeId: string | null;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    placeTrade(dto: PlaceTradeDto): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
            accountId: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        userId: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        createdAt: Date;
        tradeId: string | null;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    settleTradeWon(dto: SettleTradeWonDto): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
            accountId: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        userId: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        createdAt: Date;
        tradeId: string | null;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    settleTradeLost(dto: SettleTradeLostDto): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
            accountId: string;
            transactionId: string;
        }[];
    } & {
        id: string;
        userId: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        createdAt: Date;
        tradeId: string | null;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
}
