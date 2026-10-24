import { TradeDirection } from '@prisma/client';
export declare class CreateTradeDto {
    userId: string;
    assetId: string;
    expiryId?: string;
    direction: TradeDirection;
    stakeAmount: number;
    entryPrice: number;
    expiresAt: string;
}
