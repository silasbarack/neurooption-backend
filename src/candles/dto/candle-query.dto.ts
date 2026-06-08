import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CandleType } from './create-candle.dto';

export class CandleQueryDto {
  @IsString()
    symbol!: string;

  @IsString()
    timeframe!: string;

  @IsOptional()
  @IsEnum(CandleType)
  type?: CandleType;
}