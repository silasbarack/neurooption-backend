import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { AccountDeletionService } from './account-deletion.service';
import { AccountService } from './account.service';
import { DeleteAccountDto } from './dto/delete-account.dto';
export declare class AccountController {
    private readonly account;
    private readonly deletion;
    constructor(account: AccountService, deletion: AccountDeletionService);
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
    deletionCheck(req: AuthenticatedRequest): Promise<{
        canDelete: boolean;
        blockers: import("./account-deletion.service").DeletionBlocker[];
        reasons: readonly [{
            readonly code: "NOT_TRADING";
            readonly label: "I'm no longer trading";
        }, {
            readonly code: "SWITCHING";
            readonly label: "I'm switching to another platform";
        }, {
            readonly code: "SAFETY";
            readonly label: "I'm worried about my data or the safety of my money";
        }, {
            readonly code: "PAYMENTS";
            readonly label: "I had a problem with a deposit or withdrawal";
        }, {
            readonly code: "EXPECTATIONS";
            readonly label: "Payouts or trading conditions weren't what I expected";
        }, {
            readonly code: "FINANCES";
            readonly label: "I want to stop trading to protect my finances";
        }, {
            readonly code: "USABILITY";
            readonly label: "The platform is hard to use";
        }, {
            readonly code: "DUPLICATE";
            readonly label: "I have another NeuroOption account";
        }, {
            readonly code: "BREAK";
            readonly label: "I'm taking a break and may come back";
        }, {
            readonly code: "OTHER";
            readonly label: "Another reason";
        }];
        confirmationWord: string;
        emailHint: string;
    }>;
    deleteAccount(req: AuthenticatedRequest, dto: DeleteAccountDto, userAgent?: string): Promise<{
        success: boolean;
        message: string;
        reference: string;
        emailSent: boolean;
        emailHint: string;
    }>;
}
