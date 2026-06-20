import { IndicatorType } from '../indicators.constants';
import { CandleDto } from './candle.dto';
export declare class CalculateIndicatorDto {
    indicator: IndicatorType;
    candles: CandleDto[];
    params?: Record<string, number>;
}
