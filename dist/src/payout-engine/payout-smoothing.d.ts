import { PayoutEngineConfig } from './payout-engine.config';
export type PayoutChange = {
    at: number;
    delta: number;
};
export type SmoothingState = {
    displayed: number;
    smoothed: number | null;
    lastChangedAt: number;
    lastReviewedAt: number;
    changes: PayoutChange[];
};
export type SmoothingDecision = {
    smoothed: number | null;
    reviewed: boolean;
    next: number | null;
    reason: string;
};
export declare function clampPercent(value: number, config: PayoutEngineConfig): number;
export declare function reviewPhaseMs(symbol: string, config: PayoutEngineConfig): number;
export declare function isReviewDue(state: Pick<SmoothingState, 'lastReviewedAt'>, now: number, phaseMs: number, config: PayoutEngineConfig): boolean;
export declare function movementInLastHour(changes: PayoutChange[], now: number): number;
export declare function decidePayout(state: SmoothingState, rawTarget: number | null, now: number, phaseMs: number, config: PayoutEngineConfig): SmoothingDecision;
export declare function applyChange(state: SmoothingState, next: number, now: number): SmoothingState;
