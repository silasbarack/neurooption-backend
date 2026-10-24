import { AccountCurrency } from '@prisma/client';
import { LedgerService } from './ledger.service';
export declare class LedgerController {
    private readonly ledgerService;
    constructor(ledgerService: LedgerService);
    private assertCanReadUser;
    getBalance(req: any, userId: string, currency?: AccountCurrency): Promise<{
        userId: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        availableBalance: string;
    }>;
    getStatement(req: any, userId: string, currency?: AccountCurrency): Promise<{
        id: string;
        accountCode: import(".prisma/client").$Enums.LedgerAccountCode;
        side: import(".prisma/client").$Enums.LedgerEntrySide;
        amount: string;
        currency: import(".prisma/client").$Enums.AccountCurrency;
        memo: string;
        transactionType: import(".prisma/client").$Enums.LedgerTransactionType;
        transactionDescription: string;
        createdAt: Date;
    }[]>;
}
