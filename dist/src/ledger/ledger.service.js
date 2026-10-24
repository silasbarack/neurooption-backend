"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
const ledger_types_1 = require("./ledger.types");
let LedgerService = class LedgerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateAccount(tx, params) {
        const { userId, code, currency } = params;
        if (userId !== null) {
            return tx.ledgerAccount.upsert({
                where: { userId_code_currency: { userId, code, currency } },
                update: {},
                create: {
                    userId,
                    code,
                    currency,
                    type: ledger_types_1.LEDGER_ACCOUNT_TYPE[code],
                    name: ledger_types_1.LEDGER_ACCOUNT_NAME[code],
                    isSystem: false,
                },
            });
        }
        const existing = await tx.ledgerAccount.findFirst({
            where: { userId: null, code, currency },
        });
        if (existing)
            return existing;
        try {
            return await tx.ledgerAccount.create({
                data: {
                    userId: null,
                    code,
                    currency,
                    type: ledger_types_1.LEDGER_ACCOUNT_TYPE[code],
                    name: ledger_types_1.LEDGER_ACCOUNT_NAME[code],
                    isSystem: true,
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const account = await tx.ledgerAccount.findFirst({ where: { userId: null, code, currency } });
                if (account)
                    return account;
            }
            throw error;
        }
    }
    async ensureUserLedgerAccounts(userId, currency, tx = this.prisma) {
        const [available, escrow, withdrawalPending] = await Promise.all([
            this.getOrCreateAccount(tx, {
                userId,
                code: client_1.LedgerAccountCode.USER_REAL_AVAILABLE_LIABILITY,
                currency,
            }),
            this.getOrCreateAccount(tx, {
                userId,
                code: client_1.LedgerAccountCode.USER_OPEN_TRADE_ESCROW,
                currency,
            }),
            this.getOrCreateAccount(tx, {
                userId,
                code: client_1.LedgerAccountCode.USER_WITHDRAWAL_PENDING,
                currency,
            }),
        ]);
        return { available, escrow, withdrawalPending };
    }
    ensureSystemAccount(tx, code, currency) {
        return this.getOrCreateAccount(tx, { userId: null, code, currency });
    }
    async postDoubleEntryTransaction(input, tx = this.prisma) {
        if (input.idempotencyKey) {
            const existing = await tx.ledgerTransaction.findUnique({
                where: { idempotencyKey: input.idempotencyKey },
                include: { entries: true },
            });
            if (existing)
                return existing;
        }
        if (input.entries.length < 2) {
            throw new common_1.BadRequestException('A ledger transaction must have at least two entries');
        }
        let debitTotal = new ledger_types_1.Decimal(0);
        let creditTotal = new ledger_types_1.Decimal(0);
        for (const entry of input.entries) {
            const amount = (0, ledger_types_1.toDecimal)(entry.amount);
            if (amount.lessThanOrEqualTo(0)) {
                throw new common_1.BadRequestException('Ledger entry amounts must be positive');
            }
            if (entry.side === client_1.LedgerEntrySide.DEBIT) {
                debitTotal = debitTotal.plus(amount);
            }
            else {
                creditTotal = creditTotal.plus(amount);
            }
        }
        if (!debitTotal.equals(creditTotal)) {
            throw new common_1.BadRequestException(`Ledger transaction is not balanced: debits=${debitTotal.toString()} credits=${creditTotal.toString()}`);
        }
        return tx.ledgerTransaction.create({
            data: {
                type: input.type,
                currency: input.currency,
                amount: debitTotal,
                description: input.description,
                idempotencyKey: input.idempotencyKey,
                userId: input.userId,
                tradeId: input.tradeId,
                depositId: input.depositId,
                withdrawalId: input.withdrawalId,
                externalReference: input.externalReference,
                entries: {
                    create: input.entries.map((entry) => ({
                        accountId: entry.accountId,
                        side: entry.side,
                        amount: (0, ledger_types_1.toDecimal)(entry.amount),
                        currency: entry.currency ?? input.currency,
                        memo: entry.memo,
                    })),
                },
            },
            include: { entries: true },
        });
    }
    async getUserAvailableBalance(userId, currency, tx = this.prisma) {
        const account = await tx.ledgerAccount.findUnique({
            where: {
                userId_code_currency: {
                    userId,
                    code: client_1.LedgerAccountCode.USER_REAL_AVAILABLE_LIABILITY,
                    currency,
                },
            },
        });
        if (!account)
            return new ledger_types_1.Decimal(0);
        const sums = await tx.ledgerEntry.groupBy({
            by: ['side'],
            where: { accountId: account.id },
            _sum: { amount: true },
        });
        const credit = sums.find((row) => row.side === client_1.LedgerEntrySide.CREDIT)?._sum.amount ?? new ledger_types_1.Decimal(0);
        const debit = sums.find((row) => row.side === client_1.LedgerEntrySide.DEBIT)?._sum.amount ?? new ledger_types_1.Decimal(0);
        return new ledger_types_1.Decimal(credit).minus(new ledger_types_1.Decimal(debit));
    }
    async getUserStatement(userId, currency) {
        const accounts = await this.prisma.ledgerAccount.findMany({
            where: { userId, currency },
            select: { id: true },
        });
        if (accounts.length === 0)
            return [];
        return this.prisma.ledgerEntry.findMany({
            where: { accountId: { in: accounts.map((account) => account.id) } },
            include: {
                account: true,
                transaction: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async confirmDeposit(input, externalTx) {
        const amount = (0, ledger_types_1.toDecimal)(input.amount);
        if (amount.lessThanOrEqualTo(0)) {
            throw new common_1.BadRequestException('Deposit amount must be greater than zero');
        }
        const run = async (tx) => {
            const { available } = await this.ensureUserLedgerAccounts(input.userId, input.currency, tx);
            const clearingAccount = await this.ensureSystemAccount(tx, input.clearingAccountCode, input.currency);
            return this.postDoubleEntryTransaction({
                type: client_1.LedgerTransactionType.DEPOSIT_CONFIRMED,
                currency: input.currency,
                description: input.description ?? 'Deposit confirmed',
                idempotencyKey: input.idempotencyKey,
                userId: input.userId,
                depositId: input.depositId,
                externalReference: input.externalReference,
                entries: [
                    { accountId: clearingAccount.id, side: client_1.LedgerEntrySide.DEBIT, amount },
                    { accountId: available.id, side: client_1.LedgerEntrySide.CREDIT, amount },
                ],
            }, tx);
        };
        return externalTx ? run(externalTx) : this.prisma.$transaction(run);
    }
    async requestWithdrawal(input, externalTx) {
        const amount = (0, ledger_types_1.toDecimal)(input.amount);
        if (amount.lessThanOrEqualTo(0)) {
            throw new common_1.BadRequestException('Withdrawal amount must be greater than zero');
        }
        const run = async (tx) => {
            const { available, withdrawalPending } = await this.ensureUserLedgerAccounts(input.userId, input.currency, tx);
            const balance = await this.getUserAvailableBalance(input.userId, input.currency, tx);
            if (balance.lessThan(amount)) {
                throw new common_1.BadRequestException(`Insufficient available balance: requested ${amount.toString()}, available ${balance.toString()}`);
            }
            return this.postDoubleEntryTransaction({
                type: client_1.LedgerTransactionType.WITHDRAWAL_REQUESTED,
                currency: input.currency,
                description: input.description ?? 'Withdrawal requested',
                idempotencyKey: input.idempotencyKey,
                userId: input.userId,
                withdrawalId: input.withdrawalId,
                entries: [
                    { accountId: available.id, side: client_1.LedgerEntrySide.DEBIT, amount },
                    { accountId: withdrawalPending.id, side: client_1.LedgerEntrySide.CREDIT, amount },
                ],
            }, tx);
        };
        return externalTx ? run(externalTx) : this.prisma.$transaction(run);
    }
    async markWithdrawalPaid(input, externalTx) {
        const amount = (0, ledger_types_1.toDecimal)(input.amount);
        const run = async (tx) => {
            const { withdrawalPending } = await this.ensureUserLedgerAccounts(input.userId, input.currency, tx);
            const clearingAccount = await this.ensureSystemAccount(tx, input.clearingAccountCode, input.currency);
            return this.postDoubleEntryTransaction({
                type: client_1.LedgerTransactionType.WITHDRAWAL_PAID,
                currency: input.currency,
                description: input.description ?? 'Withdrawal paid',
                idempotencyKey: input.idempotencyKey,
                userId: input.userId,
                withdrawalId: input.withdrawalId,
                entries: [
                    { accountId: withdrawalPending.id, side: client_1.LedgerEntrySide.DEBIT, amount },
                    { accountId: clearingAccount.id, side: client_1.LedgerEntrySide.CREDIT, amount },
                ],
            }, tx);
        };
        return externalTx ? run(externalTx) : this.prisma.$transaction(run);
    }
    async rejectWithdrawal(input, externalTx) {
        const amount = (0, ledger_types_1.toDecimal)(input.amount);
        const run = async (tx) => {
            const { available, withdrawalPending } = await this.ensureUserLedgerAccounts(input.userId, input.currency, tx);
            return this.postDoubleEntryTransaction({
                type: client_1.LedgerTransactionType.WITHDRAWAL_REJECTED,
                currency: input.currency,
                description: input.reason ?? 'Withdrawal rejected',
                idempotencyKey: input.idempotencyKey,
                userId: input.userId,
                withdrawalId: input.withdrawalId,
                entries: [
                    { accountId: withdrawalPending.id, side: client_1.LedgerEntrySide.DEBIT, amount },
                    { accountId: available.id, side: client_1.LedgerEntrySide.CREDIT, amount },
                ],
            }, tx);
        };
        return externalTx ? run(externalTx) : this.prisma.$transaction(run);
    }
    async placeTrade(input, externalTx) {
        const amount = (0, ledger_types_1.toDecimal)(input.stakeAmount);
        if (amount.lessThanOrEqualTo(0)) {
            throw new common_1.BadRequestException('Stake amount must be greater than zero');
        }
        const run = async (tx) => {
            const { available, escrow } = await this.ensureUserLedgerAccounts(input.userId, input.currency, tx);
            const balance = await this.getUserAvailableBalance(input.userId, input.currency, tx);
            if (balance.lessThan(amount)) {
                throw new common_1.BadRequestException(`Insufficient available balance to place trade: requested ${amount.toString()}, available ${balance.toString()}`);
            }
            return this.postDoubleEntryTransaction({
                type: client_1.LedgerTransactionType.TRADE_PLACED,
                currency: input.currency,
                description: 'Trade stake reserved in escrow',
                idempotencyKey: input.idempotencyKey,
                userId: input.userId,
                tradeId: input.tradeId,
                entries: [
                    { accountId: available.id, side: client_1.LedgerEntrySide.DEBIT, amount },
                    { accountId: escrow.id, side: client_1.LedgerEntrySide.CREDIT, amount },
                ],
            }, tx);
        };
        return externalTx ? run(externalTx) : this.prisma.$transaction(run);
    }
    async settleTradeWon(input, externalTx) {
        const stake = (0, ledger_types_1.toDecimal)(input.stakeAmount);
        const profit = (0, ledger_types_1.toDecimal)(input.profitAmount);
        const totalReturn = stake.plus(profit);
        const run = async (tx) => {
            const { available, escrow } = await this.ensureUserLedgerAccounts(input.userId, input.currency, tx);
            const payoutExpenseAccount = await this.ensureSystemAccount(tx, client_1.LedgerAccountCode.PLATFORM_TRADING_PAYOUT_EXPENSE, input.currency);
            return this.postDoubleEntryTransaction({
                type: client_1.LedgerTransactionType.TRADE_WON,
                currency: input.currency,
                description: 'Trade won - stake and profit returned to user',
                idempotencyKey: input.idempotencyKey,
                userId: input.userId,
                tradeId: input.tradeId,
                entries: [
                    { accountId: escrow.id, side: client_1.LedgerEntrySide.DEBIT, amount: stake },
                    { accountId: payoutExpenseAccount.id, side: client_1.LedgerEntrySide.DEBIT, amount: profit },
                    { accountId: available.id, side: client_1.LedgerEntrySide.CREDIT, amount: totalReturn },
                ],
            }, tx);
        };
        return externalTx ? run(externalTx) : this.prisma.$transaction(run);
    }
    async settleTradeLost(input, externalTx) {
        const amount = (0, ledger_types_1.toDecimal)(input.stakeAmount);
        const run = async (tx) => {
            const { escrow } = await this.ensureUserLedgerAccounts(input.userId, input.currency, tx);
            const revenueAccount = await this.ensureSystemAccount(tx, client_1.LedgerAccountCode.PLATFORM_TRADING_REVENUE, input.currency);
            return this.postDoubleEntryTransaction({
                type: client_1.LedgerTransactionType.TRADE_LOST,
                currency: input.currency,
                description: 'Trade lost - stake recognized as platform revenue',
                idempotencyKey: input.idempotencyKey,
                userId: input.userId,
                tradeId: input.tradeId,
                entries: [
                    { accountId: escrow.id, side: client_1.LedgerEntrySide.DEBIT, amount },
                    { accountId: revenueAccount.id, side: client_1.LedgerEntrySide.CREDIT, amount },
                ],
            }, tx);
        };
        return externalTx ? run(externalTx) : this.prisma.$transaction(run);
    }
    async refundTrade(input, externalTx) {
        const amount = (0, ledger_types_1.toDecimal)(input.stakeAmount);
        const run = async (tx) => {
            const { available, escrow } = await this.ensureUserLedgerAccounts(input.userId, input.currency, tx);
            return this.postDoubleEntryTransaction({
                type: client_1.LedgerTransactionType.TRADE_REFUNDED,
                currency: input.currency,
                description: 'Trade refunded - stake returned to user',
                idempotencyKey: input.idempotencyKey,
                userId: input.userId,
                tradeId: input.tradeId,
                entries: [
                    { accountId: escrow.id, side: client_1.LedgerEntrySide.DEBIT, amount },
                    { accountId: available.id, side: client_1.LedgerEntrySide.CREDIT, amount },
                ],
            }, tx);
        };
        return externalTx ? run(externalTx) : this.prisma.$transaction(run);
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map