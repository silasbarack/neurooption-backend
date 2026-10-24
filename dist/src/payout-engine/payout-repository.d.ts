import { PrismaClient } from '@prisma/client';
export type StoredPayoutState = {
    assetSymbol: string;
    marketType: string;
    category: string;
    payoutPercent: number;
    baselinePercent: number;
    targetPercent: number | null;
    smoothedPercent: number | null;
    version: number;
    lastChangedAt: number;
    lastReviewedAt: number;
};
export type PayoutHistoryEntry = {
    assetSymbol: string;
    version: number;
    previousPercent: number | null;
    payoutPercent: number;
    targetPercent: number | null;
    smoothedPercent: number | null;
    reason: string;
    riskMetrics: unknown;
    createdAt: number;
};
export type NewPayoutState = Omit<StoredPayoutState, 'targetPercent' | 'smoothedPercent'> & {
    reason: string;
};
export type PayoutChangeWrite = {
    assetSymbol: string;
    expectedVersion: number;
    previousPercent: number;
    payoutPercent: number;
    targetPercent: number | null;
    smoothedPercent: number | null;
    changedAt: number;
    reason: string;
    riskMetrics: unknown;
    config: unknown;
};
export type EvaluationWrite = {
    assetSymbol: string;
    targetPercent: number | null;
    smoothedPercent: number | null;
    lastReviewedAt: number;
    riskMetrics: unknown;
};
export type LeaderSession = {
    loadStates(): Promise<StoredPayoutState[]>;
    loadChangesSince(since: number): Promise<PayoutHistoryEntry[]>;
    insertMissing(states: NewPayoutState[]): Promise<void>;
    publishChange(change: PayoutChangeWrite): Promise<boolean>;
    saveEvaluations(evaluations: EvaluationWrite[], evaluatedAt: number): Promise<void>;
};
export interface PayoutRepository {
    readonly enabled: boolean;
    loadStates(): Promise<StoredPayoutState[]>;
    loadChangesSince(since: number): Promise<PayoutHistoryEntry[]>;
    loadHistory(assetSymbol: string, limit: number): Promise<PayoutHistoryEntry[]>;
    withLeaderLock<T>(fn: (session: LeaderSession) => Promise<T>): Promise<T | null>;
    close(): Promise<void>;
}
export declare class PrismaPayoutRepository implements PayoutRepository {
    private readonly prisma;
    readonly enabled = true;
    constructor(prisma: PrismaClient);
    loadStates(): Promise<StoredPayoutState[]>;
    loadChangesSince(since: number): Promise<PayoutHistoryEntry[]>;
    loadHistory(assetSymbol: string, limit: number): Promise<PayoutHistoryEntry[]>;
    withLeaderLock<T>(fn: (leader: LeaderSession) => Promise<T>): Promise<T | null>;
    close(): Promise<void>;
}
export declare class NoopPayoutRepository implements PayoutRepository {
    readonly enabled = false;
    loadStates(): Promise<any[]>;
    loadChangesSince(): Promise<any[]>;
    loadHistory(): Promise<any[]>;
    withLeaderLock<T>(): Promise<T | null>;
    close(): Promise<any>;
}
export declare function createPayoutRepository(): PayoutRepository;
