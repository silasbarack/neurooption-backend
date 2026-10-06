export type MarketType = 'OTC' | 'REAL';

export type NormalizedMarketTick = {
  symbol: string;
  bid: number;
  ask: number;
  mid: number;
  timestamp: number;
  sequence: number;
  source: string;
  marketType: MarketType;
  serverReceiveTimestamp: number;
};

export type CompactTickMessage = {
  type: 'tick';
  s: string;
  p: number;
  b: number;
  a: number;
  t: number;
  q: number;
  sr: number;
  sb: number;
  src: string;
  m: MarketType;
};
