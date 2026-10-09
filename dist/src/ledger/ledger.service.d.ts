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
            createdAt: Date;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            amount: Prisma.Decimal;
            transactionId: string;
            accountId: string;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        description: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        amount: Prisma.Decimal;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        idempotencyKey: string | null;
        externalReference: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        tradeId: string | null;
    }>;
    getUserAvailableBalance(userId: string, currency: AccountCurrency, tx?: PrismaClientOrTx): Promise<Decimal>;
    getUserStatement(userId: string, currency: AccountCurrency): Promise<({
        transaction: {
            id: string;
            createdAt: Date;
            userId: string | null;
            description: string | null;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            amount: Prisma.Decimal;
            type: import(".prisma/client").$Enums.LedgerTransactionType;
            idempotencyKey: string | null;
            externalReference: string | null;
            depositId: string | null;
            withdrawalId: string | null;
            tradeId: string | null;
        };
        account: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string | null;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            code: import(".prisma/client").$Enums.LedgerAccountCode;
            isActive: boolean;
            type: import(".prisma/client").$Enums.LedgerAccountType;
            isSystem: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        amount: Prisma.Decimal;
        transactionId: string;
        accountId: string;
        side: import(".prisma/client").$Enums.LedgerEntrySide;
        memo: string | null;
    })[]>;
    confirmDeposit(input: ConfirmDepositInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            createdAt: Date;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            amount: Prisma.Decimal;
            transactionId: string;
            accountId: string;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        description: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        amount: Prisma.Decimal;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        idempotencyKey: string | null;
        externalReference: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        tradeId: string | null;
    }>;
    requestWithdrawal(input: RequestWithdrawalInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            createdAt: Date;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            amount: Prisma.Decimal;
            transactionId: string;
            accountId: string;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        description: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        amount: Prisma.Decimal;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        idempotencyKey: string | null;
        externalReference: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        tradeId: string | null;
    }>;
    markWithdrawalPaid(input: MarkWithdrawalPaidInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            createdAt: Date;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            amount: Prisma.Decimal;
            transactionId: string;
            accountId: string;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        description: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        amount: Prisma.Decimal;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        idempotencyKey: string | null;
        externalReference: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        tradeId: string | null;
    }>;
    rejectWithdrawal(input: RejectWithdrawalInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            createdAt: Date;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            amount: Prisma.Decimal;
            transactionId: string;
            accountId: string;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        description: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        amount: Prisma.Decimal;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        idempotencyKey: string | null;
        externalReference: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        tradeId: string | null;
    }>;
    placeTrade(input: PlaceTradeInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            createdAt: Date;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            amount: Prisma.Decimal;
            transactionId: string;
            accountId: string;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        description: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        amount: Prisma.Decimal;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        idempotencyKey: string | null;
        externalReference: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        tradeId: string | null;
    }>;
    settleTradeWon(input: SettleTradeWonInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            createdAt: Date;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            amount: Prisma.Decimal;
            transactionId: string;
            accountId: string;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        description: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        amount: Prisma.Decimal;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        idempotencyKey: string | null;
        externalReference: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        tradeId: string | null;
    }>;
    settleTradeLost(input: SettleTradeLostInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            createdAt: Date;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            amount: Prisma.Decimal;
            transactionId: string;
            accountId: string;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        description: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        amount: Prisma.Decimal;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        idempotencyKey: string | null;
        externalReference: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        tradeId: string | null;
    }>;
    refundTrade(input: RefundTradeInput, externalTx?: PrismaClientOrTx): Promise<{
        entries: {
            id: string;
            createdAt: Date;
            currency: import(".prisma/client").$Enums.AccountCurrency;
            amount: Prisma.Decimal;
            transactionId: string;
            accountId: string;
            side: import(".prisma/client").$Enums.LedgerEntrySide;
            memo: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        description: string | null;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        amount: Prisma.Decimal;
        type: import(".prisma/client").$Enums.LedgerTransactionType;
        idempotencyKey: string | null;
        externalReference: string | null;
        depositId: string | null;
        withdrawalId: string | null;
        tradeId: string | null;
    }>;
}
