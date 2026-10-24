import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { IndicatorType } from '../indicators.constants';
import { CandleDto } from './candle.dto';

export class CalculateIndicatorDto {
  @IsEnum(IndicatorType)
  indicator!: IndicatorType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandleDto)
  candles!: CandleDto[];

  @IsOptional()
  @IsObject()
  params?: Record<string, number>;
}