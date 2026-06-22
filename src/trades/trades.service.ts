import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../config/prisma.service';
import {
  AccountCurrency,
  AccountType,
  PlacedTrade,
  TradeSide,
  TradeStatus,
} from '../trading-engine/trading-engine.types';

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: any): Promise<PlacedTrade> {
    const now = Date.now();

    const stakeAmount = Number(input.stakeAmount ?? input.amount ?? 0);
    const stakeUsd = Number(input.stakeUsd ?? stakeAmount ?? 0);
    const payoutPercent = Number(input.payoutPercent ?? 0);

    const expectedProfitAmount = Number(
      input.expectedProfitAmount ?? stakeAmount * (payoutPercent / 100),
    );

    const expectedProfitUsd = Number(
      input.expectedProfitUsd ?? expectedProfitAmount,
    );

    const expectedReturnAmount = Number(
      input.expectedReturnAmount ?? stakeAmount + expectedProfitAmount,
    );

    const expectedReturnUsd = Number(
      input.expectedReturnUsd ?? expectedReturnAmount,
    );

    const entryTimeMs = Number(input.entryTime ?? now);
    const expirySeconds = Number(input.expirySeconds ?? 60);
    const expiryTimeMs = Number(
      input.expiryTime ?? entryTimeMs + expirySeconds * 1000,
    );

    const trade = await this.prisma.engineTrade.create({
      data: {
        id: input.id === undefined ? undefined : String(input.id),
        userId: String(input.userId ?? 'demo-user'),
        walletId:
          input.walletId === undefined || input.walletId === null
            ? undefined
            : String(input.walletId),

        asset: String(input.asset ?? input.symbol ?? 'EUR/USD OTC'),
        timeframe: String(input.timeframe ?? 'M1').toUpperCase(),
        side: String(input.side ?? 'BUY').toUpperCase(),
        status: String(input.status ?? 'PENDING').toUpperCase(),

        accountType: String(input.accountType ?? 'QT Demo'),
        currency: String(input.currency ?? 'USD'),

        stakeAmount: new Prisma.Decimal(stakeAmount),
        stakeUsd: new Prisma.Decimal(stakeUsd),

        payoutPercent: new Prisma.Decimal(payoutPercent),
        expectedProfitAmount: new Prisma.Decimal(expectedProfitAmount),
        expectedProfitUsd: new Prisma.Decimal(expectedProfitUsd),
        expectedReturnAmount: new Prisma.Decimal(expectedReturnAmount),
        expectedReturnUsd: new Prisma.Decimal(expectedReturnUsd),

        entryPrice: new Prisma.Decimal(Number(input.entryPrice ?? 0)),
        closePrice:
          input.closePrice === undefined || input.closePrice === null
            ? undefined
            : new Prisma.Decimal(Number(input.closePrice)),

        entryTime: new Date(entryTimeMs),
        expiryTime: new Date(expiryTimeMs),
        expirySeconds,

        settledAt:
          input.settledAt === undefined || input.settledAt === null
            ? undefined
            : new Date(Number(input.settledAt)),

        resultAmount:
          input.resultAmount === undefined || input.resultAmount === null
            ? undefined
            : new Prisma.Decimal(Number(input.resultAmount)),

        resultUsd:
          input.resultUsd === undefined || input.resultUsd === null
            ? undefined
            : new Prisma.Decimal(Number(input.resultUsd)),

        profitAmount:
          input.profitAmount === undefined || input.profitAmount === null
            ? undefined
            : new Prisma.Decimal(Number(input.profitAmount)),

        profitUsd:
          input.profitUsd === undefined || input.profitUsd === null
            ? undefined
            : new Prisma.Decimal(Number(input.profitUsd)),

        metadata: input.metadata ?? undefined,
      },
    });

    return this.formatTrade(trade);
  }

  async update(
    tradeId: string,
    patch: Partial<PlacedTrade>,
  ): Promise<PlacedTrade | null> {
    const existing = await this.prisma.engineTrade.findUnique({
      where: { id: tradeId },
    });

    if (!existing) return null;

    const updated = await this.prisma.engineTrade.update({
      where: { id: tradeId },
      data: {
        status: patch.status,

        closePrice:
          patch.closePrice === undefined || patch.closePrice === null
            ? undefined
            : new Prisma.Decimal(Number(patch.closePrice)),

        settledAt:
          patch.settledAt === undefined || patch.settledAt === null
            ? undefined
            : new Date(Number(patch.settledAt)),

        resultAmount:
          patch.resultAmount === undefined || patch.resultAmount === null
            ? undefined
            : new Prisma.Decimal(Number(patch.resultAmount)),

        resultUsd:
          patch.resultUsd === undefined || patch.resultUsd === null
            ? undefined
            : new Prisma.Decimal(Number(patch.resultUsd)),

        profitAmount:
          patch.profitAmount === undefined || patch.profitAmount === null
            ? undefined
            : new Prisma.Decimal(Number(patch.profitAmount)),

        profitUsd:
          patch.profitUsd === undefined || patch.profitUsd === null
            ? undefined
            : new Prisma.Decimal(Number(patch.profitUsd)),
      },
    });

    return this.formatTrade(updated);
  }

  async findAll(query?: any): Promise<PlacedTrade[]> {
    const records = await this.prisma.engineTrade.findMany({
      where: {
        userId: query?.userId ? String(query.userId) : undefined,
        status: query?.status ? String(query.status).toUpperCase() : undefined,
        asset: query?.asset ? String(query.asset) : undefined,
      },
      orderBy: { entryTime: 'desc' },
      take: Math.min(Number(query?.take ?? query?.limit ?? 100), 200),
      skip: Number(query?.skip ?? 0),
    });

    return records.map((record) => this.formatTrade(record));
  }

  async findByUser(userId: string): Promise<PlacedTrade[]> {
    return this.findAllByUser(userId);
  }

  async findAllByUser(userId: string): Promise<PlacedTrade[]> {
    return this.findAll({ userId });
  }

  async findOpenByUser(userId: string): Promise<PlacedTrade[]> {
    const records = await this.prisma.engineTrade.findMany({
      where: {
        userId,
        status: 'PENDING',
      },
      orderBy: { entryTime: 'desc' },
    });

    return records.map((record) => this.formatTrade(record));
  }

  async findHistoryByUser(userId: string): Promise<PlacedTrade[]> {
    const records = await this.prisma.engineTrade.findMany({
      where: {
        userId,
        status: {
          not: 'PENDING',
        },
      },
      orderBy: [{ settledAt: 'desc' }, { entryTime: 'desc' }],
      take: 100,
    });

    return records.map((record) => this.formatTrade(record));
  }

  async findOne(tradeId: string): Promise<PlacedTrade | null> {
    return this.findById(tradeId);
  }

  async findById(tradeId: string): Promise<PlacedTrade | null> {
    const trade = await this.prisma.engineTrade.findUnique({
      where: { id: tradeId },
    });

    return trade ? this.formatTrade(trade) : null;
  }

  async settle(tradeId: string, dto?: any): Promise<PlacedTrade | null> {
    return this.update(tradeId, {
      status: String(dto?.status ?? 'DRAW').toUpperCase() as TradeStatus,
      closePrice: dto?.closePrice,
      settledAt: Date.now(),
      resultAmount: dto?.resultAmount,
      resultUsd: dto?.resultUsd,
      profitAmount: dto?.profitAmount,
      profitUsd: dto?.profitUsd,
    });
  }

  async cancel(tradeId: string, reason?: any): Promise<PlacedTrade | null> {
    const existing = await this.findById(tradeId);

    if (!existing) return null;

    const reasonText =
      typeof reason === 'string'
        ? reason
        : reason?.reason
          ? String(reason.reason)
          : 'Trade cancelled';

    await this.prisma.engineTrade.update({
      where: { id: tradeId },
      data: {
        metadata: {
          cancelReason: reasonText,
          cancelledAt: new Date().toISOString(),
        },
      },
    });

    return this.update(tradeId, {
      status: 'LOST',
      settledAt: Date.now(),
      closePrice: existing.entryPrice,
      resultAmount: 0,
      resultUsd: 0,
      profitAmount: -existing.stakeAmount,
      profitUsd: -existing.stakeUsd,
    });
  }

  private formatTrade(trade: any): PlacedTrade {
    return {
      id: trade.id,
      userId: trade.userId,
      walletId: trade.walletId,

      asset: trade.asset,
      timeframe: trade.timeframe,
      side: trade.side as TradeSide,
      accountType: trade.accountType as AccountType,
      currency: trade.currency as AccountCurrency,

      stakeAmount: Number(trade.stakeAmount),
      stakeUsd: Number(trade.stakeUsd),

      payoutPercent: Number(trade.payoutPercent),
      expectedProfitAmount: Number(trade.expectedProfitAmount),
      expectedProfitUsd: Number(trade.expectedProfitUsd),
      expectedReturnAmount: Number(trade.expectedReturnAmount),
      expectedReturnUsd: Number(trade.expectedReturnUsd),

      entryPrice: Number(trade.entryPrice),
      entryTime: new Date(trade.entryTime).getTime(),
      expirySeconds: Number(trade.expirySeconds),
      expiryTime: new Date(trade.expiryTime).getTime(),

      status: trade.status as TradeStatus,

      closePrice:
        trade.closePrice === null || trade.closePrice === undefined
          ? undefined
          : Number(trade.closePrice),

      settledAt:
        trade.settledAt === null || trade.settledAt === undefined
          ? undefined
          : new Date(trade.settledAt).getTime(),

      resultAmount:
        trade.resultAmount === null || trade.resultAmount === undefined
          ? undefined
          : Number(trade.resultAmount),

      resultUsd:
        trade.resultUsd === null || trade.resultUsd === undefined
          ? undefined
          : Number(trade.resultUsd),

      profitAmount:
        trade.profitAmount === null || trade.profitAmount === undefined
          ? undefined
          : Number(trade.profitAmount),

      profitUsd:
        trade.profitUsd === null || trade.profitUsd === undefined
          ? undefined
          : Number(trade.profitUsd),
    };
  }
}