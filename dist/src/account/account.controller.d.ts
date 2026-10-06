import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { AccountService } from './account.service';
export declare class AccountController {
    private readonly account;
    constructor(account: AccountService);
    me(req: AuthenticatedRequest): Promise<{
        id: string;
        accountNumber: string;
        fullName: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.UserRole;
        status: import(".prisma/client").$Enums.AccountStatus;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        verified: boolean;
        memberSince: Date;
        profile: {
            completion: number;
            checklist: {
                key: string;
                label: string;
                done: boolean;
            }[];
        };
        real: {
            currency: string;
            balance: number;
            locked: number;
        };
        demo: {
            currency: string;
            balance: number;
        };
    }>;
}
