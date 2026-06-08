import { AssetCategory, MarketType } from '@prisma/client';
export declare class AssetsQueryDto {
    category?: AssetCategory;
    marketType?: MarketType;
    search?: string;
}
