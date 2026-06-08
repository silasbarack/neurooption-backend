import { MarketType } from '@prisma/client';
import { AssetsService } from './assets.service';
import { AssetsQueryDto } from './dto/assets-query.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    findAll(query: AssetsQueryDto): Promise<{
        symbol: string;
        id: string;
        name: string;
        category: import(".prisma/client").$Enums.AssetCategory;
        marketType: import(".prisma/client").$Enums.MarketType;
        isActive: boolean;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
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
    findBySymbol(symbol: string, marketType?: MarketType): Promise<{
        symbol: string;
        id: string;
        name: string;
        category: import(".prisma/client").$Enums.AssetCategory;
        marketType: import(".prisma/client").$Enums.MarketType;
        isActive: boolean;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: string): Promise<{
        symbol: string;
        id: string;
        name: string;
        category: import(".prisma/client").$Enums.AssetCategory;
        marketType: import(".prisma/client").$Enums.MarketType;
        isActive: boolean;
        payoutRate: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
