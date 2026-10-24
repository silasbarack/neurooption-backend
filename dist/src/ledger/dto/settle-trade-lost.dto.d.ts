import { AccountCurrency } from '@prisma/client';
export declare class SettleTradeLostDto {
    userId: string;
    tradeId: string;
    stakeAmount: number;
    currency: AccountCurrency;
    idempotencyKey?: string;
}
