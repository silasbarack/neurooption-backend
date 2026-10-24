import { AccountCurrency } from '@prisma/client';
export declare class RejectWithdrawalDto {
    userId: string;
    amount: number;
    currency: AccountCurrency;
    withdrawalId: string;
    reason?: string;
    idempotencyKey?: string;
}
