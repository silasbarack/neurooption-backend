import { CreateTradeDto } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';
import { TradeQueryDto } from './dto/trade-query.dto';
import { TradesService } from './trades.service';
export declare class TradesController {
    private readonly tradesService;
    constructor(tradesService: TradesService);
    create(dto: CreateTradeDto): Promise<import("../trading-engine/trading-engine.types").PlacedTrade>;
    findAll(query: TradeQueryDto): Promise<import("../trading-engine/trading-engine.types").PlacedTrade[]>;
    findByUser(userId: string): Promise<import("../trading-engine/trading-engine.types").PlacedTrade[]>;
    findOne(id: string): Promise<import("../trading-engine/trading-engine.types").PlacedTrade>;
    settle(id: string, dto: SettleTradeDto): Promise<import("../trading-engine/trading-engine.types").PlacedTrade>;
    cancel(id: string, reason?: string): Promise<import("../trading-engine/trading-engine.types").PlacedTrade>;
}
