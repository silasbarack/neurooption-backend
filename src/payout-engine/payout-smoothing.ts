import { PayoutEngineConfig } from './payout-engine.config';

/**
 * Turns a noisy target into a published payout that moves rarely, in small
 * steps, and never oscillates:
 *
 *   1. EMA      the raw target is smoothed every evaluation.
 *   2. Slots    each asset is reviewed once per update interval, at its own
 *               phase in the interval, so assets do not all change together.
 *   3. Hold     a published payout stays at least minHoldMs.
 *   4. Hysteresis  the smoothed target must differ from the published payout
 *               by hysteresisPercent before anything changes.
 *   5. Rate limit  at most maxStepPercent per review and
 *               maxHourlyMovementPercent of total movement per rolling hour.
 *   6. Bounds   the result stays within [minPercent, maxPercent].
 */

export type PayoutChange = { at: number; delta: number };

export type SmoothingState = {
  /** The published, tradeable payout (whole percent). */
  displayed: number;
  /** EMA of the raw targets; null until the first usable target. */
  smoothed: number | null;
  lastChangedAt: number;
  /** Time of the last review (whether or not it changed anything). */
  lastReviewedAt: number;
  /** Published changes, for the rolling-hour budget. */
  changes: PayoutChange[];
};

export type SmoothingDecision = {
  smoothed: number | null;
  reviewed: boolean;
  next: number | null;
  reason: string;
};

const HOUR_MS = 60 * 60_000;

export function clampPercent(value: number, config: PayoutEngineConfig) {
  return Math.min(Math.max(value, config.minPercent), config.maxPercent);
}

/** Stable per-asset phase (in evaluation slots) within the update interval. */
export function reviewPhaseMs(symbol: string, config: PayoutEngineConfig) {
  const slots = Math.max(1, Math.floor(config.updateIntervalMs / config.evaluationIntervalMs));
  let hash = 2166136261;
  for (let index = 0; index < symbol.length; index += 1) {
    hash ^= symbol.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % slots) * config.evaluationIntervalMs;
}

/** True once the asset's review slot has come round since its last review. */
export function isReviewDue(
  state: Pick<SmoothingState, 'lastReviewedAt'>,
  now: number,
  phaseMs: number,
  config: PayoutEngineConfig,
) {
  const slot = (time: number) => Math.floor((time - phaseMs) / config.updateIntervalMs);
  return slot(now) > slot(state.lastReviewedAt);
}

export function movementInLastHour(changes: PayoutChange[], now: number) {
  return changes
    .filter((change) => change.at > now - HOUR_MS && change.at <= now)
    .reduce((sum, change) => sum + Math.abs(change.delta), 0);
}

export function decidePayout(
  state: SmoothingState,
  rawTarget: number | null,
  now: number,
  phaseMs: number,
  config: PayoutEngineConfig,
): SmoothingDecision {
  const smoothed =
    rawTarget === null
      ? state.smoothed
      : state.smoothed === null
      ? rawTarget
      : state.smoothed + config.emaAlpha * (rawTarget - state.smoothed);

  // A payout outside the configured bounds (e.g. after bounds were changed)
  // is corrected straight away, in limited steps like any other change.
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

  const budget = Math.max(
    0,
    config.maxHourlyMovementPercent - movementInLastHour(state.changes, now),
  );
  const size = Math.min(
    Math.max(1, Math.round(Math.abs(difference))),
    config.maxStepPercent,
    outOfBounds ? Infinity : budget,
  );
  if (size <= 0) {
    return { smoothed, reviewed: true, next: null, reason: 'HOURLY_LIMIT' };
  }

  const next = clampPercent(
    Math.round(state.displayed + Math.sign(difference) * size),
    config,
  );
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

/** Records a published change on the state (pure: returns a new state). */
export function applyChange(state: SmoothingState, next: number, now: number): SmoothingState {
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
