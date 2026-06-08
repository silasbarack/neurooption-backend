import { IsEnum, IsNumber, IsString, Min } from 'class-validator';

export enum TradeDirection {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum MarketType {
  OTC = 'OTC',
  REAL = 'REAL',
}

export class CreateTradeDto {
  @IsString()
  symbol!: string;

  @IsEnum(TradeDirection)
  direction!: TradeDirection;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsString()
  expiry!: string;

  @IsString()
  timeframe!: string;

  @IsEnum(MarketType)
  marketType!: MarketType;
}