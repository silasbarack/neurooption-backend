import { IsEnum, IsString } from 'class-validator';
import { ChartType } from './chart-type.dto';

export class ChartQueryDto {
  @IsString()
    symbol!: string;

  @IsString()
    timeframe!: string;

  @IsEnum(ChartType)
  chartType!: ChartType;
}