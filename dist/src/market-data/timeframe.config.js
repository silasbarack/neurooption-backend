"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_TIMEFRAMES = exports.TIMEFRAME_SECONDS = exports.TIMEFRAME_MS = void 0;
exports.isSupportedTimeframe = isSupportedTimeframe;
exports.normalizeTimeframe = normalizeTimeframe;
exports.timeframeBucketStart = timeframeBucketStart;
exports.TIMEFRAME_MS = {
    S5: 5_000,
    S10: 10_000,
    S15: 15_000,
    S30: 30_000,
    M1: 60_000,
    M2: 120_000,
    M3: 180_000,
    M5: 300_000,
    M10: 600_000,
    M15: 900_000,
    M30: 1_800_000,
    H1: 3_600_000,
    H4: 14_400_000,
    D1: 86_400_000,
};
exports.TIMEFRAME_SECONDS = Object.fromEntries(Object.entries(exports.TIMEFRAME_MS).map(([key, value]) => [key, value / 1000]));
exports.SUPPORTED_TIMEFRAMES = Object.keys(exports.TIMEFRAME_MS);
function isSupportedTimeframe(value) {
    return Object.prototype.hasOwnProperty.call(exports.TIMEFRAME_MS, value);
}
function normalizeTimeframe(value) {
    const normalized = (value || 'M1').trim().toUpperCase();
    if (!isSupportedTimeframe(normalized)) {
        throw new Error(`Unsupported timeframe: ${value}. Supported: ${exports.SUPPORTED_TIMEFRAMES.join(', ')}`);
    }
    return normalized;
}
function timeframeBucketStart(timestamp, timeframe) {
    const normalized = normalizeTimeframe(timeframe);
    const duration = exports.TIMEFRAME_MS[normalized];
    return Math.floor(timestamp / duration) * duration;
}
//# sourceMappingURL=timeframe.config.js.map