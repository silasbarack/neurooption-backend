import { Asset, MarketType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AssetsQueryDto } from './dto/assets-query.dto';
export declare class AssetsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: AssetsQueryDto): Promise<Asset[]>;
    getSummary(): Promise<{
        total: number;
        categories: ({
            category: "CURRENCY";
            count: number;
        } | {
            category: "CRYPTOCURRENCY";
            count: number;
        } | {
            category: "STOCK";
            count: number;
        } | {
            category: "COMMODITY";
            count: number;
        } | {
            category: "INDEX";
            count: number;
        })[];
        markets: ({
            marketType: "REAL";
            count: number;
        } | {
            marketType: "OTC";
            count: number;
        })[];
    }>;
    findById(id: string): Promise<Asset | null>;
    findBySymbol(symbol: string, marketType?: MarketType): Promise<Asset | null>;
    private countByCategory;
    private countByMarket;
}
