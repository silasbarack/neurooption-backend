import { TradeDirection, TradeStatus } from '@prisma/client';
export declare class TradeQueryDto {
    userId?: string;
    assetId?: string;
    direction?: TradeDirection;
    status?: TradeStatus;
    skip?: number;
    take?: number;
}
