export enum IndicatorPlacement {
  OVERLAY = 'OVERLAY',
  BOTTOM = 'BOTTOM',
}

export enum IndicatorType {
  SMA = 'SMA',
  EMA = 'EMA',
  WMA = 'WMA',
  BOLLINGER_BANDS = 'BOLLINGER_BANDS',
  PARABOLIC_SAR = 'PARABOLIC_SAR',
  ICHIMOKU = 'ICHIMOKU',
  DONCHIAN_CHANNEL = 'DONCHIAN_CHANNEL',
  ENVELOPES = 'ENVELOPES',

  AWESOME_OSCILLATOR = 'AWESOME_OSCILLATOR',
  RSI = 'RSI',
  MACD = 'MACD',
  CCI = 'CCI',
  ADX = 'ADX',
  ATR = 'ATR',
  WILLIAMS_R = 'WILLIAMS_R',
  MOMENTUM = 'MOMENTUM',
  STOCHASTIC_OSCILLATOR = 'STOCHASTIC_OSCILLATOR',
  OSMA = 'OSMA',
  ACCELERATOR_OSCILLATOR = 'ACCELERATOR_OSCILLATOR',
  BULLS_POWER = 'BULLS_POWER',
  DEMARKER = 'DEMARKER',
  RATE_OF_CHANGE = 'RATE_OF_CHANGE',

  STOCHASTIC = 'STOCHASTIC',
  ROC = 'ROC',
}

export const INDICATOR_DEFAULTS = {
  [IndicatorType.SMA]: {
    placement: IndicatorPlacement.OVERLAY,
    label: 'Moving Average',
    params: { period: 20 },
  },
  [IndicatorType.EMA]: {
    placement: IndicatorPlacement.OVERLAY,
    label: 'Exponential MA',
    params: { period: 20 },
  },
  [IndicatorType.WMA]: {
    placement: IndicatorPlacement.OVERLAY,
    label: 'Weighted MA',
    params: { period: 20 },
  },
  [IndicatorType.BOLLINGER_BANDS]: {
    placement: IndicatorPlacement.OVERLAY,
    label: 'Bollinger Bands',
    params: { period: 20, deviation: 2 },
  },
  [IndicatorType.PARABOLIC_SAR]: {
    placement: IndicatorPlacement.OVERLAY,
    label: 'Parabolic SAR',
    params: { step: 0.02, max: 0.2 },
  },
  [IndicatorType.ICHIMOKU]: {
    placement: IndicatorPlacement.OVERLAY,
    label: 'Ichimoku',
    params: {
      conversionPeriod: 9,
      basePeriod: 26,
      spanBPeriod: 52,
      displacement: 26,
    },
  },
  [IndicatorType.DONCHIAN_CHANNEL]: {
    placement: IndicatorPlacement.OVERLAY,
    label: 'Donchian Channel',
    params: { period: 20 },
  },
  [IndicatorType.ENVELOPES]: {
    placement: IndicatorPlacement.OVERLAY,
    label: 'Envelopes',
    params: { period: 20, deviationPercent: 0.1 },
  },

  [IndicatorType.AWESOME_OSCILLATOR]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'Awesome Oscillator',
    params: { fastPeriod: 5, slowPeriod: 34 },
  },
  [IndicatorType.RSI]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'RSI',
    params: { period: 14, overbought: 70, oversold: 30 },
  },
  [IndicatorType.MACD]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'MACD',
    params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
  },
  [IndicatorType.CCI]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'CCI',
    params: { period: 20, upperLevel: 100, lowerLevel: -100 },
  },
  [IndicatorType.ADX]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'ADX',
    params: { period: 14 },
  },
  [IndicatorType.ATR]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'ATR',
    params: { period: 14 },
  },
  [IndicatorType.WILLIAMS_R]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'Williams %R',
    params: { period: 14, overbought: -20, oversold: -80 },
  },
  [IndicatorType.MOMENTUM]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'Momentum',
    params: { period: 10 },
  },
  [IndicatorType.STOCHASTIC_OSCILLATOR]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'Stochastic Oscillator',
    params: { kPeriod: 14, dPeriod: 3, slowing: 3, overbought: 80, oversold: 20 },
  },
  [IndicatorType.OSMA]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'OsMA',
    params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
  },
  [IndicatorType.ACCELERATOR_OSCILLATOR]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'Accelerator Oscillator',
    params: { fastPeriod: 5, slowPeriod: 34, signalPeriod: 5 },
  },
  [IndicatorType.BULLS_POWER]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'Bulls Power',
    params: { period: 13 },
  },
  [IndicatorType.DEMARKER]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'DeMarker',
    params: { period: 14 },
  },
  [IndicatorType.RATE_OF_CHANGE]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'Rate of Change',
    params: { period: 12 },
  },

  [IndicatorType.STOCHASTIC]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'Stochastic Oscillator',
    params: { kPeriod: 14, dPeriod: 3, slowing: 3, overbought: 80, oversold: 20 },
  },
  [IndicatorType.ROC]: {
    placement: IndicatorPlacement.BOTTOM,
    label: 'Rate of Change',
    params: { period: 12 },
  },
};

export function normalizeIndicatorType(indicator: IndicatorType): IndicatorType {
  if (indicator === IndicatorType.STOCHASTIC) return IndicatorType.STOCHASTIC_OSCILLATOR;
  if (indicator === IndicatorType.ROC) return IndicatorType.RATE_OF_CHANGE;
  return indicator;
}