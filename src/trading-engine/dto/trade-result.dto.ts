export enum TradeStatus {
  OPEN = 'OPEN',
  WON = 'WON',
  LOST = 'LOST',
  DRAW = 'DRAW',
  CANCELLED = 'CANCELLED',
}

export class TradeResultDto {
  tradeId!: string;
  status!: TradeStatus;
  entryPrice!: number;
  closePrice!: number;
  profit!: number;
  payout!: number;
}