import { CreateTradeDto } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';
import { TradeQueryDto } from './dto/trade-query.dto';
import { TradesService } from './trades.service';
export declare class TradesController {
    private readonly tradesService;
    constructor(tradesService: TradesService);
    create(dto: CreateTradeDto): import("../trading-engine/trading-engine.types").PlacedTrade;
    findAll(query: TradeQueryDto): import("../trading-engine/trading-engine.types").PlacedTrade[];
    findByUser(userId: string): import("../trading-engine/trading-engine.types").PlacedTrade[];
    findOne(id: string): import("../trading-engine/trading-engine.types").PlacedTrade;
    settle(id: string, dto: SettleTradeDto): import("../trading-engine/trading-engine.types").PlacedTrade;
    cancel(id: string, reason?: string): import("../trading-engine/trading-engine.types").PlacedTrade;
}
