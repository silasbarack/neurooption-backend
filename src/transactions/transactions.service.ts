import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../config/prisma.service';
import { AccountType } from '../trading-engine/trading-engine.types';

export type TransactionType =
  | 'TRADE_STAKE'
  | 'TRADE_WIN_RETURN'
  | 'TRADE_DRAW_REFUND'
  | 'TRADE_LOSS'
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'ADJUSTMENT';

export type TransactionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED'
  | 'CANCELLED';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(record: any) {
    const transaction = await this.prisma.engineTransaction.create({
      data: {
        userId: String(record?.userId ?? 'demo-user'),
        walletId: record?.walletId === undefined ? null : String(record.walletId),
        tradeId: record?.tradeId === undefined ? null : String(record.tradeId),
        accountType: String(record?.accountType ?? 'QT Demo') as AccountType,
        currency: String(record?.currency ?? 'USD'),
        type: this.normalizeType(record?.type),
        status: this.normalizeStatus(record?.status ?? 'COMPLETED'),
        amount: new Prisma.Decimal(Number(record?.amount ?? record?.amountUsd ?? 0)),
        amountUsd: new Prisma.Decimal(Number(record?.amountUsd ?? record?.amount ?? 0)),
        balanceAfter:
          record?.balanceAfter === undefined
            ? undefined
            : new Prisma.Decimal(Number(record.balanceAfter)),
        balanceAfterUsd:
          record?.balanceAfterUsd === undefined
            ? undefined
            : new Prisma.Decimal(Number(record.balanceAfterUsd)),
        description: String(record?.description ?? 'Transaction record'),
        reference: record?.reference === undefined ? undefined : String(record.reference),
        reason: record?.reason === undefined ? undefined : String(record.reason),
        metadata: record?.metadata ?? undefined,
      },
    });

    return this.formatTransaction(transaction);
  }

  async findAll(query?: any) {
    const records = await this.prisma.engineTransaction.findMany({
      where: {
        userId: query?.userId ? String(query.userId) : undefined,
        type: query?.type ? String(query.type).toUpperCase() : undefined,
        status: query?.status ? String(query.status).toUpperCase() : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(query?.take ?? query?.limit ?? 100), 200),
      skip: Number(query?.skip ?? 0),
    });

    return records.map((record) => this.formatTransaction(record));
  }

  async findByUser(userId: string) {
    return this.findAll({ userId });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.engineTransaction.findUnique({
      where: { id },
    });

    return transaction ? this.formatTransaction(transaction) : null;
  }

  async findByTrade(tradeId: string) {
    const records = await this.prisma.engineTransaction.findMany({
      where: { tradeId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.formatTransaction(record));
  }

  async updateStatus(id: string, dto: any) {
    return this.patch(id, {
      status: this.normalizeStatus(dto?.status ?? dto),
      reason: dto?.reason,
    });
  }

  async markProcessing(id: string) {
    return this.patch(id, { status: 'PROCESSING' });
  }

  async markCompleted(id: string) {
    return this.patch(id, { status: 'COMPLETED' });
  }

  async markFailed(id: string, reason?: any) {
    return this.patch(id, {
      status: 'FAILED',
      reason: this.extractReason(reason),
    });
  }

  async markRejected(id: string, reason?: any) {
    return this.patch(id, {
      status: 'REJECTED',
      reason: this.extractReason(reason),
    });
  }

  async markCancelled(id: string, reason?: any) {
    return this.patch(id, {
      status: 'CANCELLED',
      reason: this.extractReason(reason),
    });
  }

  private async patch(id: string, patch: any) {
    const transaction = await this.prisma.engineTransaction.update({
      where: { id },
      data: patch,
    });

    return this.formatTransaction(transaction);
  }

  private normalizeType(type: any): TransactionType {
    const value = String(type ?? 'ADJUSTMENT').toUpperCase();

    const allowed: TransactionType[] = [
      'TRADE_STAKE',
      'TRADE_WIN_RETURN',
      'TRADE_DRAW_REFUND',
      'TRADE_LOSS',
      'DEPOSIT',
      'WITHDRAWAL',
      'ADJUSTMENT',
    ];

    return allowed.includes(value as TransactionType)
      ? (value as TransactionType)
      : 'ADJUSTMENT';
  }

  private normalizeStatus(status: any): TransactionStatus {
    const value = String(status ?? 'PENDING').toUpperCase();

    const allowed: TransactionStatus[] = [
      'PENDING',
      'PROCESSING',
      'COMPLETED',
      'FAILED',
      'REJECTED',
      'CANCELLED',
    ];

    return allowed.includes(value as TransactionStatus)
      ? (value as TransactionStatus)
      : 'PENDING';
  }

  private extractReason(reasonOrDto?: any): string | undefined {
    if (reasonOrDto === undefined || reasonOrDto === null) return undefined;
    if (typeof reasonOrDto === 'string') return reasonOrDto;
    if (reasonOrDto.reason !== undefined) return String(reasonOrDto.reason);
    return undefined;
  }

  private formatTransaction(transaction: any) {
    return {
      id: transaction.id,
      userId: transaction.userId,
      walletId: transaction.walletId,
      tradeId: transaction.tradeId,
      accountType: transaction.accountType,
      currency: transaction.currency,
      type: transaction.type,
      status: transaction.status,
      amount: Number(transaction.amount),
      amountUsd: Number(transaction.amountUsd),
      balanceAfter:
        transaction.balanceAfter === null || transaction.balanceAfter === undefined
          ? undefined
          : Number(transaction.balanceAfter),
      balanceAfterUsd:
        transaction.balanceAfterUsd === null || transaction.balanceAfterUsd === undefined
          ? undefined
          : Number(transaction.balanceAfterUsd),
      description: transaction.description,
      reference: transaction.reference,
      reason: transaction.reason,
      metadata: transaction.metadata,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}