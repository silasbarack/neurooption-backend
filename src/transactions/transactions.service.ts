import { Injectable } from '@nestjs/common';
import { AccountType } from '../trading-engine/trading-engine.types';

export type TransactionType =
  | 'TRADE_STAKE'
  | 'TRADE_WIN_RETURN'
  | 'TRADE_DRAW_REFUND'
  | 'TRADE_LOSS'
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'WITHDRAWAL_PROCESSING'
  | 'WITHDRAWAL_COMPLETED'
  | 'WITHDRAWAL_FAILED'
  | 'WITHDRAWAL_REJECTED'
  | 'WITHDRAWAL_CANCELLED'
  | 'ADJUSTMENT';

export type TransactionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED'
  | 'CANCELLED';

export type TransactionRecord = {
  id: string;
  userId: string;
  accountType: AccountType;
  tradeId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amountUsd: number;
  balanceAfterUsd?: number;
  description: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class TransactionsService {
  private readonly transactions: TransactionRecord[] = [];

  create(record: any): TransactionRecord {
    const now = new Date().toISOString();

    const transaction: TransactionRecord = {
      id: String(record?.id ?? this.createId('txn')),
      userId: String(record?.userId ?? 'demo-user'),
      accountType: String(record?.accountType ?? 'QT Demo') as AccountType,
      tradeId: record?.tradeId === undefined ? undefined : String(record.tradeId),
      type: this.normalizeType(record?.type),
      status: this.normalizeStatus(record?.status ?? 'COMPLETED'),
      amountUsd: Number(record?.amountUsd ?? record?.amount ?? 0),
      balanceAfterUsd:
        record?.balanceAfterUsd === undefined
          ? undefined
          : Number(record.balanceAfterUsd),
      description: String(record?.description ?? 'Transaction record'),
      reason: record?.reason === undefined ? undefined : String(record.reason),
      createdAt: String(record?.createdAt ?? now),
      updatedAt: String(record?.updatedAt ?? now),
    };

    this.transactions.push(transaction);
    return transaction;
  }

  findAll(query?: any): TransactionRecord[] {
    let records = [...this.transactions];

    if (query?.userId) {
      records = records.filter(
        (transaction) => transaction.userId === String(query.userId),
      );
    }

    if (query?.type) {
      records = records.filter(
        (transaction) =>
          transaction.type === String(query.type).toUpperCase(),
      );
    }

    if (query?.status) {
      records = records.filter(
        (transaction) =>
          transaction.status === String(query.status).toUpperCase(),
      );
    }

    return records.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  findByUser(userId: string): TransactionRecord[] {
    return this.findAll({ userId });
  }

  findOne(id: string): TransactionRecord | null {
    return this.transactions.find((transaction) => transaction.id === id) ?? null;
  }

  findByTrade(tradeId: string): TransactionRecord[] {
    return this.transactions.filter(
      (transaction) => transaction.tradeId === tradeId,
    );
  }

  updateStatus(id: string, dto: any): TransactionRecord | null {
    const status = this.normalizeStatus(dto?.status ?? dto);
    const reason = dto?.reason === undefined ? undefined : String(dto.reason);

    return this.patch(id, {
      status,
      reason,
    });
  }

  markProcessing(id: string, dto?: any): TransactionRecord | null {
    return this.patch(id, {
      status: 'PROCESSING',
      reason: this.extractReason(dto),
    });
  }

  markCompleted(id: string, dto?: any): TransactionRecord | null {
    return this.patch(id, {
      status: 'COMPLETED',
      reason: this.extractReason(dto),
    });
  }

  markFailed(id: string, reasonOrDto?: any): TransactionRecord | null {
    return this.patch(id, {
      status: 'FAILED',
      reason: this.extractReason(reasonOrDto),
    });
  }

  markRejected(id: string, reasonOrDto?: any): TransactionRecord | null {
    return this.patch(id, {
      status: 'REJECTED',
      reason: this.extractReason(reasonOrDto),
    });
  }

  markCancelled(id: string, reasonOrDto?: any): TransactionRecord | null {
    return this.patch(id, {
      status: 'CANCELLED',
      reason: this.extractReason(reasonOrDto),
    });
  }

  private patch(id: string, patch: Partial<TransactionRecord>) {
    const index = this.transactions.findIndex(
      (transaction) => transaction.id === id,
    );

    if (index < 0) return null;

    const updated: TransactionRecord = {
      ...this.transactions[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.transactions[index] = updated;
    return updated;
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
      'WITHDRAWAL_PROCESSING',
      'WITHDRAWAL_COMPLETED',
      'WITHDRAWAL_FAILED',
      'WITHDRAWAL_REJECTED',
      'WITHDRAWAL_CANCELLED',
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

  private createId(prefix: string) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}