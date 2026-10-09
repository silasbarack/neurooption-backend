import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { DeleteAccountDto } from './dto/delete-account.dto';
export type DeletionBlocker = {
    code: 'STAFF_ACCOUNT' | 'FUNDS' | 'LOCKED_FUNDS' | 'OPEN_TRADES' | 'PENDING_WITHDRAWAL' | 'PENDING_DEPOSIT';
    message: string;
    action?: {
        label: string;
        path: string;
    };
};
export declare function maskEmail(email: string): string;
export declare class AccountDeletionService {
    private readonly prisma;
    private readonly emails;
    private readonly logger;
    private readonly passwordFailures;
    constructor(prisma: PrismaService, emails: EmailsService);
    check(userId: string): Promise<{
        canDelete: boolean;
        blockers: DeletionBlocker[];
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
    deleteAccount(userId: string, dto: DeleteAccountDto, meta?: {
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        success: boolean;
        message: string;
        reference: string;
        emailSent: boolean;
        emailHint: string;
    }>;
    private verifyPassword;
    private findBlockers;
}
