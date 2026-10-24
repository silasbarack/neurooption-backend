"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPIRY_ADJUSTMENTS = exports.DEFAULT_PAYOUT_ENGINE_CONFIG = void 0;
exports.loadPayoutEngineConfig = loadPayoutEngineConfig;
exports.validatePayoutEngineConfig = validatePayoutEngineConfig;
exports.expiryAdjustment = expiryAdjustment;
function envNumber(name, fallback) {
    const raw = process.env[name];
    if (raw === undefined || raw.trim() === '')
        return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
}
exports.DEFAULT_PAYOUT_ENGINE_CONFIG = {
    minPercent: 20,
    maxPercent: 92,
    evaluationIntervalMs: 60_000,
    updateIntervalMs: 10 * 60_000,
    minHoldMs: 10 * 60_000,
    maxStepPercent: 2,
    maxHourlyMovementPercent: 6,
    emaAlpha: 0.2,
    hysteresisPercent: 0.75,
    maxRiskReductionPercent: 6,
    maxStabilityBonusPercent: 3,
};
function loadPayoutEngineConfig() {
    const d = exports.DEFAULT_PAYOUT_ENGINE_CONFIG;
    const config = {
        minPercent: envNumber('PAYOUT_MIN_PERCENT', d.minPercent),
        maxPercent: envNumber('PAYOUT_MAX_PERCENT', d.maxPercent),
        evaluationIntervalMs: envNumber('PAYOUT_EVALUATION_INTERVAL_MS', d.evaluationIntervalMs),
        updateIntervalMs: envNumber('PAYOUT_UPDATE_INTERVAL_MS', d.updateIntervalMs),
        minHoldMs: envNumber('PAYOUT_MIN_HOLD_MS', d.minHoldMs),
        maxStepPercent: envNumber('PAYOUT_MAX_STEP_PERCENT', d.maxStepPercent),
        maxHourlyMovementPercent: envNumber('PAYOUT_MAX_HOURLY_MOVEMENT_PERCENT', d.maxHourlyMovementPercent),
        emaAlpha: envNumber('PAYOUT_EMA_ALPHA', d.emaAlpha),
        hysteresisPercent: envNumber('PAYOUT_HYSTERESIS_PERCENT', d.hysteresisPercent),
        maxRiskReductionPercent: envNumber('PAYOUT_MAX_RISK_REDUCTION_PERCENT', d.maxRiskReductionPercent),
        maxStabilityBonusPercent: envNumber('PAYOUT_MAX_STABILITY_BONUS_PERCENT', d.maxStabilityBonusPercent),
    };
    return validatePayoutEngineConfig(config);
}
function validatePayoutEngineConfig(config) {
    const problems = [];
    if (!(config.minPercent >= 0 && config.minPercent < config.maxPercent && config.maxPercent <= 100)) {
        problems.push('need 0 <= minPercent < maxPercent <= 100');
    }
    if (!(config.evaluationIntervalMs >= 1_000))
        problems.push('evaluationIntervalMs must be >= 1000');
    if (!(config.updateIntervalMs >= config.evaluationIntervalMs)) {
        problems.push('updateIntervalMs must be >= evaluationIntervalMs');
    }
    if (!(config.minHoldMs >= 0))
        problems.push('minHoldMs must be >= 0');
    if (!(config.maxStepPercent >= 1))
        problems.push('maxStepPercent must be >= 1');
    if (!(config.maxHourlyMovementPercent >= config.maxStepPercent)) {
        problems.push('maxHourlyMovementPercent must be >= maxStepPercent');
    }
    if (!(config.emaAlpha > 0 && config.emaAlpha <= 1))
        problems.push('emaAlpha must be in (0, 1]');
    if (!(config.hysteresisPercent >= 0))
        problems.push('hysteresisPercent must be >= 0');
    if (problems.length) {
        throw new Error(`Invalid payout engine configuration: ${problems.join('; ')}`);
    }
    return config;
}
exports.EXPIRY_ADJUSTMENTS = [
    { maxSeconds: 15, adjustPercent: -3 },
    { maxSeconds: 30, adjustPercent: -2 },
    { minSeconds: 300, adjustPercent: 1 },
];
function expiryAdjustment(expirySeconds) {
    for (const rule of exports.EXPIRY_ADJUSTMENTS) {
        if (rule.maxSeconds !== undefined && expirySeconds <= rule.maxSeconds)
            return rule.adjustPercent;
        if (rule.minSeconds !== undefined && expirySeconds >= rule.minSeconds)
            return rule.adjustPercent;
    }
    return 0;
}
//# sourceMappingURL=payout-engine.config.js.map