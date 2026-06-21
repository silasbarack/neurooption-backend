import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AccountCurrency,
  AccountType,
  currencyToUsd,
  usdToCurrency,
} from '../trading-engine/trading-engine.types';

type InternalWallet = {
  userId: string;
  balancesUsd: Record<AccountType, number>;
  updatedAt: string;
};

type WithdrawalStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

type WithdrawalRecord = {
  id: string;
  userId: string;
  accountType: AccountType;
  currency: AccountCurrency;
  amount: number;
  amountUsd: number;
  status: WithdrawalStatus;
  reason?: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class WalletsService {
  private readonly wallets = new Map<string, InternalWallet>();
  private readonly withdrawals = new Map<string, WithdrawalRecord>();

  getWallet(userId: string) {
    const wallet = this.ensureWallet(userId);

    return {
      userId: wallet.userId,
      balancesUsd: { ...wallet.balancesUsd },
      updatedAt: wallet.updatedAt,
    };
  }

  getUserWallets(
    userIdOrQuery: any = 'demo-user',
    accountType?: AccountType,
    currency?: AccountCurrency,
  ) {
    const userId =
      typeof userIdOrQuery === 'object'
        ? String(userIdOrQuery?.userId ?? 'demo-user')
        : String(userIdOrQuery ?? 'demo-user');

    const selectedCurrency =
      currency ??
      (typeof userIdOrQuery === 'object'
        ? (userIdOrQuery?.currency as AccountCurrency)
        : undefined) ??
      'USD';

    const wallet = this.ensureWallet(userId);

    const accountTypes: AccountType[] = accountType
      ? [accountType]
      : ['QT Demo', 'QT Real'];

    return accountTypes.map((type) =>
      this.getBalance(userId, type, selectedCurrency),
    );
  }

  getBalance(
    userId: string,
    accountType: AccountType = 'QT Demo',
    currency: AccountCurrency = 'USD',
  ) {
    const wallet = this.ensureWallet(userId);
    const usdBalance = wallet.balancesUsd[accountType] ?? 0;

    return {
      userId,
      accountType,
      currency,
      balanceUsd: Number(usdBalance.toFixed(2)),
      balance: Number(usdToCurrency(usdBalance, currency).toFixed(2)),
      updatedAt: wallet.updatedAt,
    };
  }

  debit(userId: string, accountType: AccountType, amountUsd: number) {
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      throw new BadRequestException('Debit amount must be greater than zero.');
    }

    const wallet = this.ensureWallet(userId);
    const currentBalance = wallet.balancesUsd[accountType] ?? 0;

    if (currentBalance < amountUsd) {
      throw new BadRequestException('Insufficient balance.');
    }

    wallet.balancesUsd[accountType] = Number(
      (currentBalance - amountUsd).toFixed(8),
    );
    wallet.updatedAt = new Date().toISOString();

    return this.getWallet(userId);
  }

  credit(userId: string, accountType: AccountType, amountUsd: number) {
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      throw new BadRequestException('Credit amount must be greater than zero.');
    }

    const wallet = this.ensureWallet(userId);

    wallet.balancesUsd[accountType] = Number(
      ((wallet.balancesUsd[accountType] ?? 0) + amountUsd).toFixed(8),
    );
    wallet.updatedAt = new Date().toISOString();

    return this.getWallet(userId);
  }

  deposit(dto: any) {
    const userId = String(dto?.userId ?? 'demo-user');
    const accountType = String(dto?.accountType ?? 'QT Demo') as AccountType;
    const currency = String(dto?.currency ?? 'USD') as AccountCurrency;

    const amount = Number(dto?.amount ?? dto?.amountUsd ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Deposit amount must be greater than zero.');
    }

    const amountUsd =
      dto?.amountUsd !== undefined ? Number(dto.amountUsd) : currencyToUsd(amount, currency);

    this.credit(userId, accountType, amountUsd);

    return {
      message: 'Deposit completed.',
      wallet: this.getBalance(userId, accountType, currency),
    };
  }

  withdraw(dto: any) {
    const userId = String(dto?.userId ?? 'demo-user');
    const accountType = String(dto?.accountType ?? 'QT Demo') as AccountType;
    const currency = String(dto?.currency ?? 'USD') as AccountCurrency;

    const amount = Number(dto?.amount ?? dto?.amountUsd ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be greater than zero.');
    }

    const amountUsd =
      dto?.amountUsd !== undefined ? Number(dto.amountUsd) : currencyToUsd(amount, currency);

    this.debit(userId, accountType, amountUsd);

    const now = new Date().toISOString();

    const withdrawal: WithdrawalRecord = {
      id: this.createId('wd'),
      userId,
      accountType,
      currency,
      amount,
      amountUsd,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };

    this.withdrawals.set(withdrawal.id, withdrawal);

    return {
      message: 'Withdrawal requested.',
      withdrawal,
      wallet: this.getBalance(userId, accountType, currency),
    };
  }

  markWithdrawalProcessing(id: string, dto?: any) {
    return this.patchWithdrawal(id, {
      status: 'PROCESSING',
      reason: this.extractReason(dto),
    });
  }

  completeWithdrawal(id: string, dto?: any) {
    return this.patchWithdrawal(id, {
      status: 'COMPLETED',
      reason: this.extractReason(dto),
    });
  }

  rejectWithdrawal(id: string, reasonOrDto?: any) {
    const withdrawal = this.withdrawals.get(id);

    if (!withdrawal) return null;

    if (withdrawal.status !== 'REJECTED' && withdrawal.status !== 'COMPLETED') {
      this.credit(withdrawal.userId, withdrawal.accountType, withdrawal.amountUsd);
    }

    return this.patchWithdrawal(id, {
      status: 'REJECTED',
      reason: this.extractReason(reasonOrDto),
    });
  }

  cancelWithdrawal(id: string, reasonOrDto?: any) {
    const withdrawal = this.withdrawals.get(id);

    if (!withdrawal) return null;

    if (withdrawal.status !== 'CANCELLED' && withdrawal.status !== 'COMPLETED') {
      this.credit(withdrawal.userId, withdrawal.accountType, withdrawal.amountUsd);
    }

    return this.patchWithdrawal(id, {
      status: 'CANCELLED',
      reason: this.extractReason(reasonOrDto),
    });
  }

  findWithdrawal(id: string) {
    return this.withdrawals.get(id) ?? null;
  }

  findWithdrawals(userId?: string) {
    const records = Array.from(this.withdrawals.values());

    if (!userId) {
      return records.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return records
      .filter((record) => record.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  private patchWithdrawal(
    id: string,
    patch: Partial<WithdrawalRecord>,
  ): WithdrawalRecord | null {
    const existing = this.withdrawals.get(id);

    if (!existing) return null;

    const updated: WithdrawalRecord = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.withdrawals.set(id, updated);
    return updated;
  }

  private ensureWallet(userId: string): InternalWallet {
    const safeUserId = userId?.trim() || 'demo-user';

    const existing = this.wallets.get(safeUserId);

    if (existing) return existing;

    const wallet: InternalWallet = {
      userId: safeUserId,
      balancesUsd: {
        'QT Demo': 70000,
        'QT Real': 0,
      },
      updatedAt: new Date().toISOString(),
    };

    this.wallets.set(safeUserId, wallet);

    return wallet;
  }

  private extractReason(reasonOrDto?: any): string | undefined {
    if (reasonOrDto === undefined || reasonOrDto === null) return undefined;

    if (typeof reasonOrDto === 'string') return reasonOrDto;

    if (reasonOrDto.reason !== undefined) return String(reasonOrDto.reason);

    return undefined;
  }

  private createId(prefix: string) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}