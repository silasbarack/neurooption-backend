import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { IndicatorType } from '../indicators.constants';

export { IndicatorType } from '../indicators.constants';

export class IndicatorQueryDto {
  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsString()
  asset?: string;

  @IsOptional()
  @IsString()
  timeframe?: string;

  @IsEnum(IndicatorType)
  indicator!: IndicatorType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  period?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(20)
  @Max(500)
  limit?: number;
}