import { IsEnum, IsNumber, IsString } from 'class-validator';

export enum TradeStatus {
  OPEN = 'OPEN',
  WON = 'WON',
  LOST = 'LOST',
  DRAW = 'DRAW',
  CANCELLED = 'CANCELLED',
}

export class TradeUpdateDto {
  @IsString()
    userId!: string;

  @IsString()
    tradeId!: string;

  @IsString()
    symbol!: string;

  @IsEnum(TradeStatus)
    status!: TradeStatus;

  @IsNumber()
    entryPrice!: number;

  @IsNumber()
    closePrice!: number;

  @IsNumber()
    amount!: number;

  @IsNumber()
    profit!: number;

  @IsNumber()
    payout!: number;
}