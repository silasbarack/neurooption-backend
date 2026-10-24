import { AccountCurrency } from '@prisma/client';
import type { DepositProvider } from '../ledger.types';
export declare class MarkWithdrawalPaidDto {
    userId: string;
    amount: number;
    currency: AccountCurrency;
    withdrawalId: string;
    provider: DepositProvider;
    idempotencyKey?: string;
    description?: string;
}
