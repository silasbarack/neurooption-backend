import { PlacedTrade } from '../trading-engine/trading-engine.types';
export declare class TradesService {
    private readonly trades;
    create(input: any): PlacedTrade;
    update(tradeId: string, patch: Partial<PlacedTrade>): PlacedTrade | null;
    findAll(query?: any): PlacedTrade[];
    findByUser(userId: string): PlacedTrade[];
    findAllByUser(userId: string): PlacedTrade[];
    findOpenByUser(userId: string): PlacedTrade[];
    findHistoryByUser(userId: string): PlacedTrade[];
    findOne(tradeId: string): PlacedTrade | null;
    findById(tradeId: string): PlacedTrade | null;
    settle(tradeId: string, dto?: any): PlacedTrade | null;
    cancel(tradeId: string, reason?: any): PlacedTrade | null;
    private createId;
}
