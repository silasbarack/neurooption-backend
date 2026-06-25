import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AccountCurrency,
  LedgerAccount,
  LedgerAccountCode,
  LedgerEntrySide,
  LedgerTransactionType,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../config/prisma.service';
import {
  ConfirmDepositInput,
  Decimal,
  LEDGER_ACCOUNT_NAME,
  LEDGER_ACCOUNT_TYPE,
  MarkWithdrawalPaidInput,
  PlaceTradeInput,
  PostDoubleEntryInput,
  PrismaClientOrTx,
  RefundTradeInput,
  RejectWithdrawalInput,
  RequestWithdrawalInput,
  SettleTradeLostInput,
  SettleTradeWonInput,
  toDecimal,
} from './ledger.types';

/**
 * Double-entry ledger for real-money balances.
 *
 * Every method here either reads from LedgerEntry rows or posts a balanced
 * LedgerTransaction (>= 2 entries, sum(debits) === sum(credits)). Demo-money
 * balances are NOT tracked here — they continue to use the existing
 * EngineWallet/mock balance path. Only deposits, withdrawals, and REAL-money
 * trades should ever call into this service.
 */
@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------
  // Account provisioning
  // ---------------------------------------------------------------------

  /**
   * Upserts (race-safe) one ledger account for a given owner/code/currency.
   *
   * User-owned accounts (userId set) use a normal Prisma `upsert` against
   * the compound unique index. System accounts (userId = null) can't go
   * through `upsert`/`findUnique` the same way: Prisma's compound-unique
   * lookup compiles to a SQL equality check, and `userId = NULL` never
   * matches anything in SQL — so we look those up with a plain filtered
   * query instead, and tolerate (by re-fetching) the rare create/create
   * race. A partial unique index on (code, currency) WHERE userId IS NULL
   * (see migrations) backs this at the database level, since Postgres's
   * normal multi-column UNIQUE constraint treats every NULL as distinct
   * and would otherwise allow duplicate system accounts.
   */
  private async getOrCreateAccount(
    tx: PrismaClientOrTx,
    params: { userId: string | null; code: LedgerAccountCode; currency: AccountCurrency },
  ): Promise<LedgerAccount> {
    const { userId, code, currency } = params;

    if (userId !== null) {
      return tx.ledgerAccount.upsert({
        where: { userId_code_currency: { userId, code, currency } },
        update: {},
        create: {
          userId,
          code,
          currency,
          type: LEDGER_ACCOUNT_TYPE[code],
          name: LEDGER_ACCOUNT_NAME[code],
          isSystem: false,
        },
      });
    }

    const existing = await tx.ledgerAccount.findFirst({
      where: { userId: null, code, currency },
    });
    if (existing) return existing;

    try {
      return await tx.ledgerAccount.create({
        data: {
          userId: null,
          code,
          currency,
          type: LEDGER_ACCOUNT_TYPE[code],
          name: LEDGER_ACCOUNT_NAME[code],
          isSystem: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const account = await tx.ledgerAccount.findFirst({ where: { userId: null, code, currency } });
        if (account) return account;
      }
      throw error;
    }
  }

  /**
   * Creates the three per-user ledger accounts (available balance, open
   * trade escrow, withdrawal pending) for a currency if they don't already
   * exist. Safe to call on every deposit/withdrawal/trade request.
   */
  async ensureUserLedgerAccounts(
    userId: string,
    currency: AccountCurrency,
    tx: PrismaClientOrTx = this.prisma,
  ): Promise<{
    available: LedgerAccount;
    escrow: LedgerAccount;
    withdrawalPending: LedgerAccount;
  }> {
    const [available, escrow, withdrawalPending] = await Promise.all([
      this.getOrCreateAccount(tx, {
        userId,
        code: LedgerAccountCode.USER_REAL_AVAILABLE_LIABILITY,
        currency,
      }),
      this.getOrCreateAccount(tx, {
        userId,
        code: LedgerAccountCode.USER_OPEN_TRADE_ESCROW,
        currency,
      }),
      this.getOrCreateAccount(tx, {
        userId,
        code: LedgerAccountCode.USER_WITHDRAWAL_PENDING,
        currency,
      }),
    ]);

    return { available, escrow, withdrawalPending };
  }

  /** System (platform-owned) accounts have userId = null. */
  private ensureSystemAccount(
    tx: PrismaClientOrTx,
    code: LedgerAccountCode,
    currency: AccountCurrency,
  ): Promise<LedgerAccount> {
    return this.getOrCreateAccount(tx, { userId: null, code, currency });
  }

  // ---------------------------------------------------------------------
  // Core posting primitive
  // ---------------------------------------------------------------------

  /**
   * Validates and posts a balanced double-entry transaction:
   *  - at least two entries
   *  - sum(DEBIT amounts) === sum(CREDIT amounts)
   *  - idempotencyKey (if given) is checked first so a retried caller
   *    (e.g. a payment webhook firing twice) gets the original transaction
   *    back instead of posting a duplicate
   *
   * Pass `tx` when this needs to run inside a balance-check-then-post
   * transaction owned by the caller (see requestWithdrawal/placeTrade).
   */
  async postDoubleEntryTransaction(
    input: PostDoubleEntryInput,
    tx: PrismaClientOrTx = this.prisma,
  ) {
    if (input.idempotencyKey) {
      const existing = await tx.ledgerTransaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { entries: true },
      });
      if (existing) return existing;
    }

    if (input.entries.length < 2) {
      throw new BadRequestException(
        'A ledger transaction must have at least two entries',
      );
    }

    let debitTotal = new Decimal(0);
    let creditTotal = new Decimal(0);

    for (const entry of input.entries) {
      const amount = toDecimal(entry.amount);

      if (amount.lessThanOrEqualTo(0)) {
        throw new BadRequestException('Ledger entry amounts must be positive');
      }

      if (entry.side === LedgerEntrySide.DEBIT) {
        debitTotal = debitTotal.plus(amount);
      } else {
        creditTotal = creditTotal.plus(amount);
      }
    }

    if (!debitTotal.equals(creditTotal)) {
      throw new BadRequestException(
        `Ledger transaction is not balanced: debits=${debitTotal.toString()} credits=${creditTotal.toString()}`,
      );
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
            amount: toDecimal(entry.amount),
            currency: entry.currency ?? input.currency,
            memo: entry.memo,
          })),
        },
      },
      include: { entries: true },
    });
  }

  // ---------------------------------------------------------------------
  // Balance / statement reads
  // ---------------------------------------------------------------------

  /**
   * A user's real-money available balance, computed purely from ledger
   * entries on their USER_REAL_AVAILABLE_LIABILITY account. For a liability
   * account, credits increase the balance owed to the user and debits
   * decrease it (the platform owes the user money, so the account's normal
   * balance sits on the credit side).
   */
  async getUserAvailableBalance(
    userId: string,
    currency: AccountCurrency,
    tx: PrismaClientOrTx = this.prisma,
  ): Promise<Decimal> {
    const account = await tx.ledgerAccount.findUnique({
      where: {
        userId_code_currency: {
          userId,
          code: LedgerAccountCode.USER_REAL_AVAILABLE_LIABILITY,
          currency,
        },
      },
    });

    if (!account) return new Decimal(0);

    const sums = await tx.ledgerEntry.groupBy({
      by: ['side'],
      where: { accountId: account.id },
      _sum: { amount: true },
    });

    const credit = sums.find((row) => row.side === LedgerEntrySide.CREDIT)?._sum.amount ?? new Decimal(0);
    const debit = sums.find((row) => row.side === LedgerEntrySide.DEBIT)?._sum.amount ?? new Decimal(0);

    return new Decimal(credit).minus(new Decimal(debit));
  }

  /** Raw ledger entries for every account this user owns in this currency, newest first. */
  async getUserStatement(userId: string, currency: AccountCurrency) {
    const accounts = await this.prisma.ledgerAccount.findMany({
      where: { userId, currency },
      select: { id: true },
    });

    if (accounts.length === 0) return [];

    return this.prisma.ledgerEntry.findMany({
      where: { accountId: { in: accounts.map((account) => account.id) } },
      include: {
        account: true,
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------------------
  // Deposits
  // ---------------------------------------------------------------------

  /**
   * Posts a confirmed deposit:
   *   DEBIT  platform cash/clearing account (money arrived)
   *   CREDIT user real available liability (we now owe the user this money)
   *
   * Pass `externalTx` to run this as part of a caller's own transaction
   * (e.g. deposits.service.ts updating its own Deposit/Transaction rows in
   * the same atomic write). Omit it to let this method manage its own
   * transaction, as the dev controller does.
   */
  async confirmDeposit(input: ConfirmDepositInput, externalTx?: PrismaClientOrTx) {
    const amount = toDecimal(input.amount);
    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException('Deposit amount must be greater than zero');
    }

    const run = async (tx: PrismaClientOrTx) => {
      const { available } = await this.ensureUserLedgerAccounts(input.userId, input.currency, tx);
      const clearingAccount = await this.ensureSystemAccount(
        tx,
        input.clearingAccountCode,
        input.currency,
      );

      return this.postDoubleEntryTransaction(
        {
          type: LedgerTransactionType.DEPOSIT_CONFIRMED,
          currency: input.currency,
          description: input.description ?? 'Deposit confirmed',
          idempotencyKey: input.idempotencyKey,
          userId: input.userId,
          depositId: input.depositId,
          externalReference: input.externalReference,
          entries: [
            { accountId: clearingAccount.id, side: LedgerEntrySide.DEBIT, amount },
            { accountId: available.id, side: LedgerEntrySide.CREDIT, amount },
          ],
        },
        tx,
      );
    };

    return externalTx ? run(externalTx) : this.prisma.$transaction(run);
  }

  // ---------------------------------------------------------------------
  // Withdrawals
  // ---------------------------------------------------------------------

  /**
   * Posts a withdrawal request:
   *   DEBIT  user real available liability (funds leave the spendable balance)
   *   CREDIT user withdrawal pending (funds held while the payout processes)
   *
   * Rejects if the user's available balance can't cover the amount — a real
   * user's available balance must never go negative.
   */
  async requestWithdrawal(input: RequestWithdrawalInput, externalTx?: PrismaClientOrTx) {
    const amount = toDecimal(input.amount);
    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException('Withdrawal amount must be greater than zero');
    }

    const run = async (tx: PrismaClientOrTx) => {
      const { available, withdrawalPending } = await this.ensureUserLedgerAccounts(
        input.userId,
        input.currency,
        tx,
      );

      const balance = await this.getUserAvailableBalance(input.userId, input.currency, tx);
      if (balance.lessThan(amount)) {
        throw new BadRequestException(
          `Insufficient available balance: requested ${amount.toString()}, available ${balance.toString()}`,
        );
      }

      return this.postDoubleEntryTransaction(
        {
          type: LedgerTransactionType.WITHDRAWAL_REQUESTED,
          currency: input.currency,
          description: input.description ?? 'Withdrawal requested',
          idempotencyKey: input.idempotencyKey,
          userId: input.userId,
          withdrawalId: input.withdrawalId,
          entries: [
            { accountId: available.id, side: LedgerEntrySide.DEBIT, amount },
            { accountId: withdrawalPending.id, side: LedgerEntrySide.CREDIT, amount },
          ],
        },
        tx,
      );
    };

    return externalTx ? run(externalTx) : this.prisma.$transaction(run);
  }

  /**
   * Posts a paid-out withdrawal:
   *   DEBIT  user withdrawal pending (the hold is released)
   *   CREDIT platform cash/clearing account (money left the platform)
   */
  async markWithdrawalPaid(input: MarkWithdrawalPaidInput, externalTx?: PrismaClientOrTx) {
    const amount = toDecimal(input.amount);

    const run = async (tx: PrismaClientOrTx) => {
      const { withdrawalPending } = await this.ensureUserLedgerAccounts(
        input.userId,
        input.currency,
        tx,
      );
      const clearingAccount = await this.ensureSystemAccount(
        tx,
        input.clearingAccountCode,
        input.currency,
      );

      return this.postDoubleEntryTransaction(
        {
          type: LedgerTransactionType.WITHDRAWAL_PAID,
          currency: input.currency,
          description: input.description ?? 'Withdrawal paid',
          idempotencyKey: input.idempotencyKey,
          userId: input.userId,
          withdrawalId: input.withdrawalId,
          entries: [
            { accountId: withdrawalPending.id, side: LedgerEntrySide.DEBIT, amount },
            { accountId: clearingAccount.id, side: LedgerEntrySide.CREDIT, amount },
          ],
        },
        tx,
      );
    };

    return externalTx ? run(externalTx) : this.prisma.$transaction(run);
  }

  /**
   * Posts a rejected withdrawal:
   *   DEBIT  user withdrawal pending (the hold is released)
   *   CREDIT user real available liability (funds are returned to the user)
   */
  async rejectWithdrawal(input: RejectWithdrawalInput, externalTx?: PrismaClientOrTx) {
    const amount = toDecimal(input.amount);

    const run = async (tx: PrismaClientOrTx) => {
      const { available, withdrawalPending } = await this.ensureUserLedgerAccounts(
        input.userId,
        input.currency,
        tx,
      );

      return this.postDoubleEntryTransaction(
        {
          type: LedgerTransactionType.WITHDRAWAL_REJECTED,
          currency: input.currency,
          description: input.reason ?? 'Withdrawal rejected',
          idempotencyKey: input.idempotencyKey,
          userId: input.userId,
          withdrawalId: input.withdrawalId,
          entries: [
            { accountId: withdrawalPending.id, side: LedgerEntrySide.DEBIT, amount },
            { accountId: available.id, side: LedgerEntrySide.CREDIT, amount },
          ],
        },
        tx,
      );
    };

    return externalTx ? run(externalTx) : this.prisma.$transaction(run);
  }

  // ---------------------------------------------------------------------
  // Trading
  // ---------------------------------------------------------------------

  /**
   * Posts a placed trade's stake:
   *   DEBIT  user real available liability (stake leaves the spendable balance)
   *   CREDIT user open trade escrow (held while the trade is open)
   *
   * Rejects if the available balance can't cover the stake.
   */
  async placeTrade(input: PlaceTradeInput, externalTx?: PrismaClientOrTx) {
    const amount = toDecimal(input.stakeAmount);
    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException('Stake amount must be greater than zero');
    }

    const run = async (tx: PrismaClientOrTx) => {
      const { available, escrow } = await this.ensureUserLedgerAccounts(
        input.userId,
        input.currency,
        tx,
      );

      const balance = await this.getUserAvailableBalance(input.userId, input.currency, tx);
      if (balance.lessThan(amount)) {
        throw new BadRequestException(
          `Insufficient available balance to place trade: requested ${amount.toString()}, available ${balance.toString()}`,
        );
      }

      return this.postDoubleEntryTransaction(
        {
          type: LedgerTransactionType.TRADE_PLACED,
          currency: input.currency,
          description: 'Trade stake reserved in escrow',
          idempotencyKey: input.idempotencyKey,
          userId: input.userId,
          tradeId: input.tradeId,
          entries: [
            { accountId: available.id, side: LedgerEntrySide.DEBIT, amount },
            { accountId: escrow.id, side: LedgerEntrySide.CREDIT, amount },
          ],
        },
        tx,
      );
    };

    return externalTx ? run(externalTx) : this.prisma.$transaction(run);
  }

  /**
   * Posts a winning trade (stake + profit returned to the user):
   *   DEBIT  user open trade escrow                 (stakeAmount)
   *   DEBIT  platform trading payout expense         (profitAmount)
   *   CREDIT user real available liability  (stakeAmount + profitAmount)
   */
  async settleTradeWon(input: SettleTradeWonInput, externalTx?: PrismaClientOrTx) {
    const stake = toDecimal(input.stakeAmount);
    const profit = toDecimal(input.profitAmount);
    const totalReturn = stake.plus(profit);

    const run = async (tx: PrismaClientOrTx) => {
      const { available, escrow } = await this.ensureUserLedgerAccounts(
        input.userId,
        input.currency,
        tx,
      );
      const payoutExpenseAccount = await this.ensureSystemAccount(
        tx,
        LedgerAccountCode.PLATFORM_TRADING_PAYOUT_EXPENSE,
        input.currency,
      );

      return this.postDoubleEntryTransaction(
        {
          type: LedgerTransactionType.TRADE_WON,
          currency: input.currency,
          description: 'Trade won - stake and profit returned to user',
          idempotencyKey: input.idempotencyKey,
          userId: input.userId,
          tradeId: input.tradeId,
          entries: [
            { accountId: escrow.id, side: LedgerEntrySide.DEBIT, amount: stake },
            { accountId: payoutExpenseAccount.id, side: LedgerEntrySide.DEBIT, amount: profit },
            { accountId: available.id, side: LedgerEntrySide.CREDIT, amount: totalReturn },
          ],
        },
        tx,
      );
    };

    return externalTx ? run(externalTx) : this.prisma.$transaction(run);
  }

  /**
   * Posts a losing trade (stake recognized as platform revenue):
   *   DEBIT  user open trade escrow
   *   CREDIT platform trading revenue
   */
  async settleTradeLost(input: SettleTradeLostInput, externalTx?: PrismaClientOrTx) {
    const amount = toDecimal(input.stakeAmount);

    const run = async (tx: PrismaClientOrTx) => {
      const { escrow } = await this.ensureUserLedgerAccounts(input.userId, input.currency, tx);
      const revenueAccount = await this.ensureSystemAccount(
        tx,
        LedgerAccountCode.PLATFORM_TRADING_REVENUE,
        input.currency,
      );

      return this.postDoubleEntryTransaction(
        {
          type: LedgerTransactionType.TRADE_LOST,
          currency: input.currency,
          description: 'Trade lost - stake recognized as platform revenue',
          idempotencyKey: input.idempotencyKey,
          userId: input.userId,
          tradeId: input.tradeId,
          entries: [
            { accountId: escrow.id, side: LedgerEntrySide.DEBIT, amount },
            { accountId: revenueAccount.id, side: LedgerEntrySide.CREDIT, amount },
          ],
        },
        tx,
      );
    };

    return externalTx ? run(externalTx) : this.prisma.$transaction(run);
  }

  /**
   * Posts a cancelled/refunded trade (stake returned to the user):
   *   DEBIT  user open trade escrow
   *   CREDIT user real available liability
   */
  async refundTrade(input: RefundTradeInput, externalTx?: PrismaClientOrTx) {
    const amount = toDecimal(input.stakeAmount);

    const run = async (tx: PrismaClientOrTx) => {
      const { available, escrow } = await this.ensureUserLedgerAccounts(
        input.userId,
        input.currency,
        tx,
      );

      return this.postDoubleEntryTransaction(
        {
          type: LedgerTransactionType.TRADE_REFUNDED,
          currency: input.currency,
          description: 'Trade refunded - stake returned to user',
          idempotencyKey: input.idempotencyKey,
          userId: input.userId,
          tradeId: input.tradeId,
          entries: [
            { accountId: escrow.id, side: LedgerEntrySide.DEBIT, amount },
            { accountId: available.id, side: LedgerEntrySide.CREDIT, amount },
          ],
        },
        tx,
      );
    };

    return externalTx ? run(externalTx) : this.prisma.$transaction(run);
  }
}
