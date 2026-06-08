import { IsDateString, IsEnum, IsNumber, IsString } from 'class-validator';

export enum CandleType {
  CANDLESTICK = 'CANDLESTICK',
  HEIKEN_ASHI = 'HEIKEN_ASHI',
  BAR = 'BAR',
  LINE = 'LINE',
}

export class CreateCandleDto {
  @IsString()
    symbol!: string;

  @IsString()
  timeframe: string | undefined;

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

  @IsDateString()
    openedAt!: string;

  @IsDateString()
    closedAt!: string;
}