import { IsEnum, IsNumber, IsString } from 'class-validator';

export enum MarketType {
  OTC = 'OTC',
  REAL = 'REAL',
}

export class PriceFeedDto {
  @IsString()
    symbol!: string;

  @IsEnum(MarketType)
    marketType!: MarketType;

  @IsNumber()
    bid!: number;

  @IsNumber()
    ask!: number;
}