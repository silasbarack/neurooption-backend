"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampPercent = clampPercent;
exports.reviewPhaseMs = reviewPhaseMs;
exports.isReviewDue = isReviewDue;
exports.movementInLastHour = movementInLastHour;
exports.decidePayout = decidePayout;
exports.applyChange = applyChange;
const HOUR_MS = 60 * 60_000;
function clampPercent(value, config) {
    return Math.min(Math.max(value, config.minPercent), config.maxPercent);
}
function reviewPhaseMs(symbol, config) {
    const slots = Math.max(1, Math.floor(config.updateIntervalMs / config.evaluationIntervalMs));
    let hash = 2166136261;
    for (let index = 0; index < symbol.length; index += 1) {
        hash ^= symbol.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return ((hash >>> 0) % slots) * config.evaluationIntervalMs;
}
function isReviewDue(state, now, phaseMs, config) {
    const slot = (time) => Math.floor((time - phaseMs) / config.updateIntervalMs);
    return slot(now) > slot(state.lastReviewedAt);
}
function movementInLastHour(changes, now) {
    return changes
        .filter((change) => change.at > now - HOUR_MS && change.at <= now)
        .reduce((sum, change) => sum + Math.abs(change.delta), 0);
}
function decidePayout(state, rawTarget, now, phaseMs, config) {
    const smoothed = rawTarget === null
        ? state.smoothed
        : state.smoothed === null
            ? rawTarget
            : state.smoothed + config.emaAlpha * (rawTarget - state.smoothed);
    const outOfBounds = clampPercent(state.displayed, config) !== state.displayed;
    if (!outOfBounds && !isReviewDue(state, now, phaseMs, config)) {
        return { smoothed, reviewed: false, next: null, reason: 'NOT_DUE' };
    }
    if (!outOfBounds && now - state.lastChangedAt < config.minHoldMs) {
        return { smoothed, reviewed: true, next: null, reason: 'HOLD' };
    }
    const goal = outOfBounds
        ? clampPercent(state.displayed, config)
        : smoothed === null
            ? null
            : clampPercent(smoothed, config);
    if (goal === null) {
        return { smoothed, reviewed: true, next: null, reason: 'NO_DATA' };
    }
    const difference = goal - state.displayed;
    if (!outOfBounds && Math.abs(difference) < config.hysteresisPercent) {
        return { smoothed, reviewed: true, next: null, reason: 'STABLE' };
    }
    const budget = Math.max(0, config.maxHourlyMovementPercent - movementInLastHour(state.changes, now));
    const size = Math.min(Math.max(1, Math.round(Math.abs(difference))), config.maxStepPercent, outOfBounds ? Infinity : budget);
    if (size <= 0) {
        return { smoothed, reviewed: true, next: null, reason: 'HOURLY_LIMIT' };
    }
    const next = clampPercent(Math.round(state.displayed + Math.sign(difference) * size), config);
    if (next === state.displayed) {
        return { smoothed, reviewed: true, next: null, reason: 'AT_BOUND' };
    }
    return {
        smoothed,
        reviewed: true,
        next,
        reason: outOfBounds ? 'CONFIG_BOUNDS' : difference > 0 ? 'CONDITIONS_EASED' : 'RISK_INCREASED',
    };
}
function applyChange(state, next, now) {
    return {
        ...state,
        displayed: next,
        lastChangedAt: now,
        lastReviewedAt: now,
        changes: [
            ...state.changes.filter((change) => change.at > now - HOUR_MS),
            { at: now, delta: next - state.displayed },
        ],
    };
}
//# sourceMappingURL=payout-smoothing.js.map