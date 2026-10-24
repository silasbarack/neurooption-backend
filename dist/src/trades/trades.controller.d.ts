import { TradeQueryDto } from './dto/trade-query.dto';
import { TradesService } from './trades.service';
export declare class TradesController {
    private readonly tradesService;
    constructor(tradesService: TradesService);
    findAll(query: TradeQueryDto): Promise<import("../trading-engine/trading-engine.types").PlacedTrade[]>;
    findByUser(req: {
        user: {
            id: string;
            role: string;
        };
    }, userId: string): Promise<import("../trading-engine/trading-engine.types").PlacedTrade[]>;
    findOne(req: {
        user: {
            id: string;
            role: string;
        };
    }, id: string): Promise<import("../trading-engine/trading-engine.types").PlacedTrade>;
}
