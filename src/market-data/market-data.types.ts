export type MarketCategory =
  | "Currencies"
  | "Cryptocurrencies"
  | "Indices"
  | "Stocks"
  | "Commodities";

export type OtcTimeframe = "M1" | "M2" | "M3" | "M5" | "M15" | "M30" | "H1" | "H4";

export type OtcAsset = {
  symbol: string;
  displayName: string;
  category: MarketCategory;
  market: "OTC";
  basePrice: number;
  precision: number;
  volatility: number;
  payout: number;
};

export type OtcCandle = {
  symbol: string;
  timeframe: OtcTimeframe;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  closed: boolean;
};

export type OtcStreamPayload = {
  type: "snapshot" | "tick";
  asset: OtcAsset;
  timeframe: OtcTimeframe;
  price: number;
  serverTime: number;
  candles: OtcCandle[];
};