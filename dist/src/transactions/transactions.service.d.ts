import { AccountType } from '../trading-engine/trading-engine.types';
export type TransactionType = 'TRADE_STAKE' | 'TRADE_WIN_RETURN' | 'TRADE_DRAW_REFUND' | 'TRADE_LOSS' | 'DEPOSIT' | 'WITHDRAWAL' | 'WITHDRAWAL_PROCESSING' | 'WITHDRAWAL_COMPLETED' | 'WITHDRAWAL_FAILED' | 'WITHDRAWAL_REJECTED' | 'WITHDRAWAL_CANCELLED' | 'ADJUSTMENT';
export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REJECTED' | 'CANCELLED';
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
export declare class TransactionsService {
    private readonly transactions;
    create(record: any): TransactionRecord;
    findAll(query?: any): TransactionRecord[];
    findByUser(userId: string): TransactionRecord[];
    findOne(id: string): TransactionRecord | null;
    findByTrade(tradeId: string): TransactionRecord[];
    updateStatus(id: string, dto: any): TransactionRecord | null;
    markProcessing(id: string, dto?: any): TransactionRecord | null;
    markCompleted(id: string, dto?: any): TransactionRecord | null;
    markFailed(id: string, reasonOrDto?: any): TransactionRecord | null;
    markRejected(id: string, reasonOrDto?: any): TransactionRecord | null;
    markCancelled(id: string, reasonOrDto?: any): TransactionRecord | null;
    private patch;
    private normalizeType;
    private normalizeStatus;
    private extractReason;
    private createId;
}
