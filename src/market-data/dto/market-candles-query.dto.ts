import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { SUPPORTED_TIMEFRAMES } from '../market-data.constants';

export class MarketCandlesQueryDto {
  @IsString()
  asset!: string;

  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_TIMEFRAMES)
  timeframe: string = 'M1';

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(20)
  @Max(500)
  limit: number = 180;
}