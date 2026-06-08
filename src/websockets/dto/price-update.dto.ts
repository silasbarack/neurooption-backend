import { IsEnum, IsNumber, IsString } from 'class-validator';

export enum MarketType {
  OTC = 'OTC',
  REAL = 'REAL',
}

export class PriceUpdateDto {
  @IsString()
    symbol!: string;

  @IsEnum(MarketType)
    marketType!: MarketType;

  @IsNumber()
    bid!: number;

  @IsNumber()
    ask!: number;

  @IsNumber()
    mid!: number;

  @IsString()
    timestamp!: string;
}