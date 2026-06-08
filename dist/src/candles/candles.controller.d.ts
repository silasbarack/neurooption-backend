import { CandlesService } from './candles.service';
import { CreateCandleDto } from './dto/create-candle.dto';
import { CandleQueryDto } from './dto/candle-query.dto';
export declare class CandlesController {
    private readonly candlesService;
    constructor(candlesService: CandlesService);
    create(dto: CreateCandleDto): {
        openedAt: Date;
        closedAt: Date;
        createdAt: Date;
        symbol: string;
        timeframe: string | undefined;
        type: import("./dto/create-candle.dto").CandleType;
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
