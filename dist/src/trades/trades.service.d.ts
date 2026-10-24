import { PrismaService } from '../config/prisma.service';
import { PlacedTrade } from '../trading-engine/trading-engine.types';
export declare class TradesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(input: any): Promise<PlacedTrade>;
    update(tradeId: string, patch: Partial<PlacedTrade>): Promise<PlacedTrade | null>;
    findAll(query?: any): Promise<PlacedTrade[]>;
    findByUser(userId: string): Promise<PlacedTrade[]>;
    findAllByUser(userId: string): Promise<PlacedTrade[]>;
    findOpenByUser(userId: string): Promise<PlacedTrade[]>;
    findHistoryByUser(userId: string): Promise<PlacedTrade[]>;
    findOne(tradeId: string): Promise<PlacedTrade | null>;
    findById(tradeId: string): Promise<PlacedTrade | null>;
    settle(tradeId: string, dto?: any): Promise<PlacedTrade | null>;
    cancel(tradeId: string, reason?: any): Promise<PlacedTrade | null>;
    private formatTrade;
}
