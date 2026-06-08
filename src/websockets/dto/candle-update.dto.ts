import { IsEnum, IsNumber, IsString } from 'class-validator';

export enum CandleType {
  CANDLESTICK = 'CANDLESTICK',
  HEIKEN_ASHI = 'HEIKEN_ASHI',
  BAR = 'BAR',
  LINE = 'LINE',
}

export class CandleUpdateDto {
  @IsString()
  symbol!: string;

  @IsString()
  timeframe!: string;

  @IsEnum(CandleType)
  type!: CandleType;

  @IsNumber()
  open!: number;

  @IsNumber()
  high!: number;

  @IsNumber()
  low!: number;

  @IsNumber()
  close!: number;

  @IsNumber()
  volume!: number;

  @IsString()
  openedAt!: string;

  @IsString()
  closedAt!: string;
}