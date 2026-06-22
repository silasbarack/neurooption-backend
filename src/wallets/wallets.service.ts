import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import {
  AccountCurrency,
  AccountType,
  currencyToUsd,
  usdToCurrency,
} from '../trading-engine/trading-engine.types';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(userId: string) {
    return this.prisma.engineWallet.findMany({
      where: { userId: userId?.trim() || 'demo-user' },
      orderBy: [{ accountType: 'asc' }, { currency: 'asc' }],
    });
  }

  async getUserWallets(userIdOrQuery: any = 'demo-user') {
    const userId =
      typeof userIdOrQuery === 'object'
        ? String(userIdOrQuery?.userId ?? 'demo-user')
        : String(userIdOrQuery ?? 'demo-user');

    return this.getWallet(userId);
  }

  async getBalance(
    userId: string,
    accountType: AccountType = 'QT Demo',
    currency: AccountCurrency = 'USD',
  ) {
    const wallet = await this.ensureWallet(userId, accountType, currency);

    return this.formatWallet(wallet);
  }

  async debit(userId: string, accountType: AccountType, amountUsd: number) {
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      throw new BadRequestException('Debit amount must be greater than zero.');
    }

    const wallet = await this.ensureWallet(userId, accountType, 'USD');
    const currentUsd = Number(wallet.balanceUsd);

    if (currentUsd < amountUsd) {
      throw new BadRequestException('Insufficient balance.');
    }

    return this.prisma.engineWallet.update({
      where: { id: wallet.id },
      data: {
        balanceUsd: new Prisma.Decimal(currentUsd - amountUsd),
        balance: new Prisma.Decimal(Number(wallet.balance) - amountUsd),
      },
    });
  }

  async credit(userId: string, accountType: AccountType, amountUsd: number) {
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      throw new BadRequestException('Credit amount must be greater than zero.');
    }

    const wallet = await this.ensureWallet(userId, accountType, 'USD');
    const currentUsd = Number(wallet.balanceUsd);

    return this.prisma.engineWallet.update({
      where: { id: wallet.id },
      data: {
        balanceUsd: new Prisma.Decimal(currentUsd + amountUsd),
        balance: new Prisma.Decimal(Number(wallet.balance) + amountUsd),
      },
    });
  }

  async deposit(dto: any) {
    const userId = String(dto?.userId ?? 'demo-user');
    const accountType = String(dto?.accountType ?? 'QT Demo') as AccountType;
    const currency = String(dto?.currency ?? 'USD') as AccountCurrency;
    const amount = Number(dto?.amount ?? dto?.amountUsd ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Deposit amount must be greater than zero.');
    }

    const amountUsd =
      dto?.amountUsd !== undefined ? Number(dto.amountUsd) : currencyToUsd(amount, currency);

    const wallet = await this.ensureWallet(userId, accountType, currency);

    const updatedWallet = await this.prisma.engineWallet.update({
      where: { id: wallet.id },
      data: {
        balanceUsd: new Prisma.Decimal(Number(wallet.balanceUsd) + amountUsd),
        balance: new Prisma.Decimal(Number(wallet.balance) + amount),
      },
    });

    return {
      message: 'Deposit completed.',
      wallet: this.formatWallet(updatedWallet),
    };
  }

  async withdraw(dto: any) {
    const userId = String(dto?.userId ?? 'demo-user');
    const accountType = String(dto?.accountType ?? 'QT Demo') as AccountType;
    const currency = String(dto?.currency ?? 'USD') as AccountCurrency;
    const amount = Number(dto?.amount ?? dto?.amountUsd ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be greater than zero.');
    }

    const amountUsd =
      dto?.amountUsd !== undefined ? Number(dto.amountUsd) : currencyToUsd(amount, currency);

    const wallet = await this.ensureWallet(userId, accountType, currency);

    if (Number(wallet.balanceUsd) < amountUsd) {
      throw new BadRequestException('Insufficient balance.');
    }

    const updatedWallet = await this.prisma.engineWallet.update({
      where: { id: wallet.id },
      data: {
        balanceUsd: new Prisma.Decimal(Number(wallet.balanceUsd) - amountUsd),
        balance: new Prisma.Decimal(Number(wallet.balance) - amount),
        lockedUsd: new Prisma.Decimal(Number(wallet.lockedUsd) + amountUsd),
        locked: new Prisma.Decimal(Number(wallet.locked) + amount),
      },
    });

    return {
      message: 'Withdrawal requested.',
      wallet: this.formatWallet(updatedWallet),
    };
  }

  async markWithdrawalProcessing(id: string) {
    return { id, status: 'PROCESSING' };
  }

  async completeWithdrawal(id: string) {
    return { id, status: 'COMPLETED' };
  }

  async rejectWithdrawal(id: string, dto?: any) {
    return { id, status: 'REJECTED', reason: dto?.reason ?? null };
  }

  async ensureWallet(
    userId: string,
    accountType: AccountType = 'QT Demo',
    currency: AccountCurrency = 'USD',
  ) {
    const safeUserId = userId?.trim() || 'demo-user';
    const defaultUsd = accountType === 'QT Demo' ? 70000 : 0;
    const defaultBalance = usdToCurrency(defaultUsd, currency);

    return this.prisma.engineWallet.upsert({
      where: {
        userId_accountType_currency: {
          userId: safeUserId,
          accountType,
          currency,
        },
      },
      update: {},
      create: {
        userId: safeUserId,
        accountType,
        currency,
        balance: new Prisma.Decimal(defaultBalance),
        balanceUsd: new Prisma.Decimal(defaultUsd),
        locked: new Prisma.Decimal(0),
        lockedUsd: new Prisma.Decimal(0),
      },
    });
  }

  private formatWallet(wallet: any) {
    return {
      id: wallet.id,
      userId: wallet.userId,
      accountType: wallet.accountType,
      currency: wallet.currency,
      balance: Number(Number(wallet.balance).toFixed(2)),
      balanceUsd: Number(Number(wallet.balanceUsd).toFixed(2)),
      locked: Number(Number(wallet.locked).toFixed(2)),
      lockedUsd: Number(Number(wallet.lockedUsd).toFixed(2)),
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }
}