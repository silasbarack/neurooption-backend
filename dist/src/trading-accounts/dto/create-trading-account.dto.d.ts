import { AccountCurrency, AccountType } from '@prisma/client';
export declare class CreateTradingAccountDto {
    userId: string;
    type: AccountType;
    currency: AccountCurrency;
}
