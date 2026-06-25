import { AccountCurrency } from '@prisma/client';
import type { DepositProvider } from '../ledger.types';
export declare class ConfirmDepositDto {
    userId: string;
    amount: number;
    currency: AccountCurrency;
    provider: DepositProvider;
    idempotencyKey: string;
    externalReference?: string;
    depositId?: string;
    description?: string;
}
