import { IndicatorType } from '../indicators.constants';
export { IndicatorType } from '../indicators.constants';
export declare class IndicatorQueryDto {
    symbol?: string;
    asset?: string;
    timeframe?: string;
    indicator: IndicatorType;
    period?: number;
    limit?: number;
}
