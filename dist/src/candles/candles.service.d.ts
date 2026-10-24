import { CreateCandleDto, CandleType } from './dto/create-candle.dto';
import { CandleQueryDto } from './dto/candle-query.dto';
export declare class CandlesService {
    private candles;
    create(dto: CreateCandleDto): {
        openedAt: Date;
        closedAt: Date;
        createdAt: Date;
        symbol: string;
        timeframe: string | undefined;
        type: CandleType;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
        id: `${string}-${string}-${string}-${string}-${string}`;
    };
    findAll(): any[];
    findByQuery(query: CandleQueryDto): any[];
    generateHeikenAshi(symbol: string, timeframe: string): any[];
}
