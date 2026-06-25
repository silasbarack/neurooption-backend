import { AccountCurrency, LedgerAccount, Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { ConfirmDepositInput, Decimal, MarkWithdrawalPaidInput, PlaceTradeInput, PostDoubleEntryInput, PrismaClientOrTx, RefundTradeInput, RejectWithdrawalInput, RequestWithdrawalInput, SettleTradeLostInput, SettleTradeWonInput } from './ledger.types';
export declare class LedgerService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getOrCreateAccount;
    ensureUserLedgerAccounts(userId: string, currency: AccountCurrency, tx?: PrismaClientOrTx): Promise<{
        available: LedgerAccount;
        escrow: LedgerAccount;
        withdrawalPending: LedgerAccount;
    }>;
    private ensureSystemAccount;
    postDoubleEntryTransaction(input: PostDoubleEntryInput, tx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    getUserAvailableBalance(userId: string, currency: AccountCurrency, tx?: PrismaClientOrTx): Promise<Decimal>;
    getUserStatement(userId: string, currency: AccountCurrency): Promise<({
        transaction: {
            id: string;
            userId: string | null;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            tradeId: string | null;
            type: import(".prisma/client").$Enums.LedgerTransactionType;
            amount: Prisma.Decimal;
            description: string | null;
            idempotencyKey: string | null;
            depositId: string | null;
            withdrawalId: string | null;
            externalReference: string | null;
        };
        account: {
            id: string;
            userId: string | null;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import(".prisma/client").$Enums.LedgerAccountType;
            code: import(".prisma/client").$Enums.LedgerAccountCode;
            isSystem: boolean;
            isActive: boolean;
        };
    } & {
        id: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        createdAt: Date;
        amount: Prisma.Decimal;
        side: import(".prisma/client").$Enums.LedgerEntrySide;
        memo: string | null;
        accountId: string;
        transactionId: string;
    })[]>;
    confirmDeposit(input: ConfirmDepositInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    requestWithdrawal(input: RequestWithdrawalInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    markWithdrawalPaid(input: MarkWithdrawalPaidInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    rejectWithdrawal(input: RejectWithdrawalInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    placeTrade(input: PlaceTradeInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    settleTradeWon(input: SettleTradeWonInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    settleTradeLost(input: SettleTradeLostInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
    refundTrade(input: RefundTradeInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            createdAt: Date;
            amount: Prisma.Decimal;
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
        amount: Prisma.Decimal;
        description: string | null;
        idempotencyKey: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        externalReference: string | null;
    }>;
}
