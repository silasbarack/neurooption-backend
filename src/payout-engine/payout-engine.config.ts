/**
 * Tunables for the dynamic payout engine. Every value can be overridden with
 * an environment variable so risk can retune the engine without a release;
 * the defaults are the initial product configuration.
 */
export type PayoutEngineConfig = {
  /** Payouts never go below this, whatever the market does. */
  minPercent: number;
  /** Payouts never go above this, whatever the market does. */
  maxPercent: number;
  /** How often market conditions are measured and the target recomputed. */
  evaluationIntervalMs: number;
  /** How often each asset's published payout is reviewed for a change. */
  updateIntervalMs: number;
  /** Shortest time a published payout stays unchanged. */
  minHoldMs: number;
  /** Largest change, in percentage points, at one review. */
  maxStepPercent: number;
  /** Largest total movement, in percentage points, in any rolling hour. */
  maxHourlyMovementPercent: number;
  /** EMA weight of each new target (per evaluation). */
  emaAlpha: number;
  /** Smoothed target must differ from the published payout by this much. */
  hysteresisPercent: number;
  /** Most the risk model may lower a payout below the asset's baseline. */
  maxRiskReductionPercent: number;
  /** Most the risk model may raise a payout above the asset's baseline. */
  maxStabilityBonusPercent: number;
};

function envNumber(name: string, fallback: number) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export const DEFAULT_PAYOUT_ENGINE_CONFIG: PayoutEngineConfig = {
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

export function loadPayoutEngineConfig(): PayoutEngineConfig {
  const d = DEFAULT_PAYOUT_ENGINE_CONFIG;
  const config: PayoutEngineConfig = {
    minPercent: envNumber('PAYOUT_MIN_PERCENT', d.minPercent),
    maxPercent: envNumber('PAYOUT_MAX_PERCENT', d.maxPercent),
    evaluationIntervalMs: envNumber('PAYOUT_EVALUATION_INTERVAL_MS', d.evaluationIntervalMs),
    updateIntervalMs: envNumber('PAYOUT_UPDATE_INTERVAL_MS', d.updateIntervalMs),
    minHoldMs: envNumber('PAYOUT_MIN_HOLD_MS', d.minHoldMs),
    maxStepPercent: envNumber('PAYOUT_MAX_STEP_PERCENT', d.maxStepPercent),
    maxHourlyMovementPercent: envNumber(
      'PAYOUT_MAX_HOURLY_MOVEMENT_PERCENT',
      d.maxHourlyMovementPercent,
    ),
    emaAlpha: envNumber('PAYOUT_EMA_ALPHA', d.emaAlpha),
    hysteresisPercent: envNumber('PAYOUT_HYSTERESIS_PERCENT', d.hysteresisPercent),
    maxRiskReductionPercent: envNumber(
      'PAYOUT_MAX_RISK_REDUCTION_PERCENT',
      d.maxRiskReductionPercent,
    ),
    maxStabilityBonusPercent: envNumber(
      'PAYOUT_MAX_STABILITY_BONUS_PERCENT',
      d.maxStabilityBonusPercent,
    ),
  };
  return validatePayoutEngineConfig(config);
}

/** Rejects a configuration that would break the engine's guarantees. */
export function validatePayoutEngineConfig(config: PayoutEngineConfig) {
  const problems: string[] = [];
  if (!(config.minPercent >= 0 && config.minPercent < config.maxPercent && config.maxPercent <= 100)) {
    problems.push('need 0 <= minPercent < maxPercent <= 100');
  }
  if (!(config.evaluationIntervalMs >= 1_000)) problems.push('evaluationIntervalMs must be >= 1000');
  if (!(config.updateIntervalMs >= config.evaluationIntervalMs)) {
    problems.push('updateIntervalMs must be >= evaluationIntervalMs');
  }
  if (!(config.minHoldMs >= 0)) problems.push('minHoldMs must be >= 0');
  if (!(config.maxStepPercent >= 1)) problems.push('maxStepPercent must be >= 1');
  if (!(config.maxHourlyMovementPercent >= config.maxStepPercent)) {
    problems.push('maxHourlyMovementPercent must be >= maxStepPercent');
  }
  if (!(config.emaAlpha > 0 && config.emaAlpha <= 1)) problems.push('emaAlpha must be in (0, 1]');
  if (!(config.hysteresisPercent >= 0)) problems.push('hysteresisPercent must be >= 0');
  if (problems.length) {
    throw new Error(`Invalid payout engine configuration: ${problems.join('; ')}`);
  }
  return config;
}

/**
 * Payout adjustment by trade duration, applied on top of the asset payout
 * (which is quoted for a 60-second trade). Very short trades carry more
 * execution and latency risk, so they pay a little less. The adjustment
 * depends only on the expiry the trader picks, never on who is trading.
 */
export const EXPIRY_ADJUSTMENTS: Array<{
  maxSeconds?: number;
  minSeconds?: number;
  adjustPercent: number;
}> = [
  { maxSeconds: 15, adjustPercent: -3 },
  { maxSeconds: 30, adjustPercent: -2 },
  { minSeconds: 300, adjustPercent: 1 },
];

export function expiryAdjustment(expirySeconds: number) {
  for (const rule of EXPIRY_ADJUSTMENTS) {
    if (rule.maxSeconds !== undefined && expirySeconds <= rule.maxSeconds) return rule.adjustPercent;
    if (rule.minSeconds !== undefined && expirySeconds >= rule.minSeconds) return rule.adjustPercent;
  }
  return 0;
}
