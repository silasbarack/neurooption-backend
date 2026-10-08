export type PayoutEngineConfig = {
    minPercent: number;
    maxPercent: number;
    evaluationIntervalMs: number;
    updateIntervalMs: number;
    minHoldMs: number;
    maxStepPercent: number;
    maxHourlyMovementPercent: number;
    emaAlpha: number;
    hysteresisPercent: number;
    maxRiskReductionPercent: number;
    maxStabilityBonusPercent: number;
};
export declare const DEFAULT_PAYOUT_ENGINE_CONFIG: PayoutEngineConfig;
export declare function loadPayoutEngineConfig(): PayoutEngineConfig;
export declare function validatePayoutEngineConfig(config: PayoutEngineConfig): PayoutEngineConfig;
export declare const EXPIRY_ADJUSTMENTS: Array<{
    maxSeconds?: number;
    minSeconds?: number;
    adjustPercent: number;
}>;
export declare function expiryAdjustment(expirySeconds: number): number;
