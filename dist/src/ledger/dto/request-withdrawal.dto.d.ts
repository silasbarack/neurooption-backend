import { AccountCurrency } from '@prisma/client';
export declare class RequestWithdrawalDto {
    userId: string;
    amount: number;
    currency: AccountCurrency;
    withdrawalId: string;
    idempotencyKey?: string;
    description?: string;
}
