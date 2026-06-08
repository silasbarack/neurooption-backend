import { CandleType } from './create-candle.dto';
export declare class CandleQueryDto {
    symbol: string;
    timeframe: string;
    type?: CandleType;
}
