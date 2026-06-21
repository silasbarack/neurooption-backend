import { Injectable } from '@nestjs/common';
import {
  AccountCurrency,
  AccountType,
  PlacedTrade,
  TradeSide,
  TradeStatus,
} from '../trading-engine/trading-engine.types';

@Injectable()
export class TradesService {
  private readonly trades = new Map<string, PlacedTrade>();

  create(input: any): PlacedTrade {
    const now = Date.now();

    const stakeAmount = Number(input.stakeAmount ?? input.amount ?? 0);
    const stakeUsd = Number(input.stakeUsd ?? stakeAmount ?? 0);
    const payoutPercent = Number(input.payoutPercent ?? 0);
    const expectedProfitAmount = Number(
      input.expectedProfitAmount ?? stakeAmount * (payoutPercent / 100),
    );
    const expectedProfitUsd = Number(input.expectedProfitUsd ?? expectedProfitAmount);
    const expectedReturnAmount = Number(
      input.expectedReturnAmount ?? stakeAmount + expectedProfitAmount,
    );
    const expectedReturnUsd = Number(input.expectedReturnUsd ?? expectedReturnAmount);

    const trade: PlacedTrade = {
      id: String(input.id ?? this.createId('trade')),
      userId: String(input.userId ?? 'demo-user'),
      asset: String(input.asset ?? input.symbol ?? 'EUR/USD OTC'),
      timeframe: String(input.timeframe ?? 'M1').toUpperCase(),
      side: String(input.side ?? 'BUY').toUpperCase() as TradeSide,
      accountType: String(input.accountType ?? 'QT Demo') as AccountType,
      currency: String(input.currency ?? 'USD') as AccountCurrency,

      stakeAmount,
      stakeUsd,

      payoutPercent,
      expectedProfitAmount,
      expectedProfitUsd,
      expectedReturnAmount,
      expectedReturnUsd,

      entryPrice: Number(input.entryPrice ?? 0),
      entryTime: Number(input.entryTime ?? now),
      expirySeconds: Number(input.expirySeconds ?? 60),
      expiryTime: Number(input.expiryTime ?? now + Number(input.expirySeconds ?? 60) * 1000),

      status: String(input.status ?? 'PENDING').toUpperCase() as TradeStatus,
      closePrice: input.closePrice === undefined ? undefined : Number(input.closePrice),
      settledAt: input.settledAt === undefined ? undefined : Number(input.settledAt),

      resultAmount:
        input.resultAmount === undefined ? undefined : Number(input.resultAmount),
      resultUsd: input.resultUsd === undefined ? undefined : Number(input.resultUsd),
      profitAmount:
        input.profitAmount === undefined ? undefined : Number(input.profitAmount),
      profitUsd: input.profitUsd === undefined ? undefined : Number(input.profitUsd),
    };

    this.trades.set(trade.id, trade);
    return trade;
  }

  update(tradeId: string, patch: Partial<PlacedTrade>): PlacedTrade | null {
    const existing = this.trades.get(tradeId);

    if (!existing) return null;

    const updated: PlacedTrade = {
      ...existing,
      ...patch,
    };

    this.trades.set(tradeId, updated);
    return updated;
  }

  findAll(query?: any): PlacedTrade[] {
    let records = Array.from(this.trades.values());

    if (query?.userId) {
      records = records.filter((trade) => trade.userId === String(query.userId));
    }

    if (query?.status) {
      records = records.filter(
        (trade) => trade.status === String(query.status).toUpperCase(),
      );
    }

    if (query?.asset) {
      records = records.filter(
        (trade) => trade.asset.toLowerCase() === String(query.asset).toLowerCase(),
      );
    }

    return records.sort((a, b) => b.entryTime - a.entryTime);
  }

  findByUser(userId: string): PlacedTrade[] {
    return this.findAllByUser(userId);
  }

  findAllByUser(userId: string): PlacedTrade[] {
    return Array.from(this.trades.values())
      .filter((trade) => trade.userId === userId)
      .sort((a, b) => b.entryTime - a.entryTime);
  }

  findOpenByUser(userId: string): PlacedTrade[] {
    return Array.from(this.trades.values())
      .filter((trade) => trade.userId === userId && trade.status === 'PENDING')
      .sort((a, b) => b.entryTime - a.entryTime);
  }

  findHistoryByUser(userId: string): PlacedTrade[] {
    return Array.from(this.trades.values())
      .filter((trade) => trade.userId === userId && trade.status !== 'PENDING')
      .sort((a, b) => (b.settledAt ?? b.entryTime) - (a.settledAt ?? a.entryTime));
  }

  findOne(tradeId: string): PlacedTrade | null {
    return this.findById(tradeId);
  }

  findById(tradeId: string): PlacedTrade | null {
    return this.trades.get(tradeId) ?? null;
  }

  settle(tradeId: string, dto?: any): PlacedTrade | null {
    const status = String(dto?.status ?? 'DRAW').toUpperCase() as TradeStatus;

    return this.update(tradeId, {
      status,
      closePrice: dto?.closePrice === undefined ? undefined : Number(dto.closePrice),
      settledAt: Date.now(),
      resultAmount:
        dto?.resultAmount === undefined ? undefined : Number(dto.resultAmount),
      resultUsd: dto?.resultUsd === undefined ? undefined : Number(dto.resultUsd),
      profitAmount:
        dto?.profitAmount === undefined ? undefined : Number(dto.profitAmount),
      profitUsd: dto?.profitUsd === undefined ? undefined : Number(dto.profitUsd),
    });
  }

  cancel(tradeId: string, reason?: any): PlacedTrade | null {
    const existing = this.findById(tradeId);

    if (!existing) return null;

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

  private createId(prefix: string) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }
}