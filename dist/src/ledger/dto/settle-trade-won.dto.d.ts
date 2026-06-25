import { AccountCurrency } from '@prisma/client';
export declare class SettleTradeWonDto {
    userId: string;
    tradeId: string;
    stakeAmount: number;
    profitAmount: number;
    currency: AccountCurrency;
    idempotencyKey?: string;
}
