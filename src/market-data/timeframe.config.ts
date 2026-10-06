export const TIMEFRAME_MS = {
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
} as const;

export type MarketTimeframe = keyof typeof TIMEFRAME_MS;

export const TIMEFRAME_SECONDS: Record<MarketTimeframe, number> =
  Object.fromEntries(
    Object.entries(TIMEFRAME_MS).map(([key, value]) => [key, value / 1000]),
  ) as Record<MarketTimeframe, number>;

export const SUPPORTED_TIMEFRAMES = Object.keys(
  TIMEFRAME_MS,
) as MarketTimeframe[];

export function isSupportedTimeframe(value: string): value is MarketTimeframe {
  return Object.prototype.hasOwnProperty.call(TIMEFRAME_MS, value);
}

export function normalizeTimeframe(value?: string): MarketTimeframe {
  const normalized = (value || 'M1').trim().toUpperCase();

  if (!isSupportedTimeframe(normalized)) {
    throw new Error(
      `Unsupported timeframe: ${value}. Supported: ${SUPPORTED_TIMEFRAMES.join(', ')}`,
    );
  }

  return normalized;
}

export function timeframeBucketStart(
  timestamp: number,
  timeframe: MarketTimeframe | string,
): number {
  const normalized = normalizeTimeframe(timeframe);
  const duration = TIMEFRAME_MS[normalized];
  return Math.floor(timestamp / duration) * duration;
}
