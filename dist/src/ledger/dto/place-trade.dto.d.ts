import { AccountCurrency } from '@prisma/client';
export declare class PlaceTradeDto {
    userId: string;
    tradeId: string;
    stakeAmount: number;
    currency: AccountCurrency;
    idempotencyKey?: string;
}
