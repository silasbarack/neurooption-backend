import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
import type { AdminIdentity } from './admin-session.guard';
export declare const CONSOLE_PERMISSIONS: {
    readonly overview: readonly ["SUPER_ADMIN", "FINANCE_ADMIN", "SUPPORT_ADMIN", "KYC_ADMIN", "RISK_ADMIN", "COMPLIANCE_ADMIN"];
    readonly users: readonly ["SUPER_ADMIN", "SUPPORT_ADMIN", "KYC_ADMIN", "RISK_ADMIN", "COMPLIANCE_ADMIN", "FINANCE_ADMIN"];
    readonly userStatus: readonly ["SUPER_ADMIN", "RISK_ADMIN", "COMPLIANCE_ADMIN"];
    readonly kyc: readonly ["SUPER_ADMIN", "KYC_ADMIN", "COMPLIANCE_ADMIN"];
    readonly finance: readonly ["SUPER_ADMIN", "FINANCE_ADMIN", "COMPLIANCE_ADMIN"];
    readonly trading: readonly ["SUPER_ADMIN", "RISK_ADMIN", "COMPLIANCE_ADMIN", "FINANCE_ADMIN"];
    readonly support: readonly ["SUPER_ADMIN", "SUPPORT_ADMIN"];
    readonly audit: readonly ["SUPER_ADMIN", "COMPLIANCE_ADMIN"];
    readonly team: readonly ["SUPER_ADMIN"];
};
export type ConsoleArea = keyof typeof CONSOLE_PERMISSIONS;
type PageQuery = {
    page?: string;
    limit?: string;
};
export declare class AdminConsoleService {
    private readonly prisma;
    private readonly emails;
    constructor(prisma: PrismaService, emails: EmailsService);
    assertCan(admin: AdminIdentity, area: ConsoleArea): void;
    permissionsFor(role: string): ConsoleArea[];
    private audit;
    overview(): Promise<{
        generatedAt: string;
        users: {
            total: number;
            new24h: number;
            new7d: number;
            byStatus: {
                [k: string]: number;
            };
        };
        queues: {
            kycPending: number;
            ticketsOpen: number;
            newsletterSubscribers: number;
            depositsPending: {
                count: number;
                amount: number;
            };
            withdrawalsPending: {
                count: number;
                amount: number;
            };
        };
        money7d: {
            deposits: {
                count: number;
                amount: number;
            };
            withdrawals: {
                count: number;
                amount: number;
            };
            currency: string;
        };
        trading24h: {
            trades: number;
            openTrades: number;
            volumeUsd: number;
            winRate: number;
        };
        signups14d: {
            day: string;
            signups: number;
        }[];
        recentActivity: {
            id: string;
            action: string;
            description: string;
            adminName: string;
            createdAt: string;
        }[];
    }>;
    listUsers(query: PageQuery & {
        search?: string;
        status?: string;
        kyc?: string;
    }): Promise<{
        total: number;
        page: number;
        limit: number;
        pages: number;
        items: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            createdAt: Date;
        }[];
    }>;
    userDetail(id: string): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
            phone: string;
            role: import(".prisma/client").$Enums.UserRole;
            status: import(".prisma/client").$Enums.AccountStatus;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            referralCode: string;
            createdAt: Date;
            updatedAt: Date;
        };
        wallets: {
            currency: string;
            balance: number;
            locked: number;
        }[];
        tradingWallets: {
            accountType: string;
            currency: string;
            balance: number;
            locked: number;
        }[];
        tradeTotals: {
            trades: number;
            volumeUsd: number;
            profitUsd: number;
            won: number;
            lost: number;
        };
        trades: {
            stakeUsd: number;
            profitUsd: number;
            payoutPercent: number;
            id: string;
            status: string;
            accountType: string;
            asset: string;
            side: string;
            entryTime: Date;
        }[];
        deposits: {
            amount: number;
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            currency: string;
            externalRef: string;
        }[];
        withdrawals: {
            amount: number;
            id: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            createdAt: Date;
            currency: string;
            rejectionReason: string;
        }[];
        kyc: {
            id: string;
            status: import(".prisma/client").$Enums.KycStatus;
            createdAt: Date;
            rejectionReason: string;
            documentType: string;
            reviewedAt: Date;
        }[];
        tickets: {
            id: string;
            status: import(".prisma/client").$Enums.SupportTicketStatus;
            updatedAt: Date;
            subject: string;
        }[];
        audit: {
            id: string;
            action: string;
            description: string;
            adminName: string;
            createdAt: Date;
        }[];
    }>;
    setUserStatus(admin: AdminIdentity, id: string, body: {
        status?: string;
        reason?: string;
    }): Promise<{
        success: boolean;
        status: "ACTIVE" | "SUSPENDED" | "LOCKED";
    }>;
    listKyc(query: PageQuery & {
        status?: string;
    }): Promise<{
        total: number;
        page: number;
        limit: number;
        pages: number;
        items: {
            id: string;
            user: {
                id: string;
                fullName: string;
                email: string;
            };
            documentType: string;
            documentNumber: string;
            images: {
                front: string;
                back: string;
                selfie: string;
                addressProof: string;
            };
            status: import(".prisma/client").$Enums.KycStatus;
            rejectionReason: string;
            reviewedBy: string;
            reviewedAt: Date;
            createdAt: Date;
        }[];
    }>;
    reviewKyc(admin: AdminIdentity, id: string, body: {
        decision?: string;
        reason?: string;
    }): Promise<{
        success: boolean;
        status: string;
    }>;
    listFinance(query: PageQuery & {
        kind?: string;
        status?: string;
        search?: string;
    }): Promise<{
        kind: string;
        total: number;
        page: number;
        limit: number;
        pages: number;
        sum: number;
        items: {
            id: string;
            user: {
                id: string;
                fullName: string;
                email: string;
            };
            gateway: string;
            amount: number;
            currency: string;
            phone: string;
            reference: string;
            status: import(".prisma/client").$Enums.TransactionStatus;
            note: string | null;
            createdAt: Date;
        }[];
    }>;
    listTickets(query: PageQuery & {
        status?: string;
        search?: string;
    }): Promise<{
        total: number;
        page: number;
        limit: number;
        pages: number;
        items: {
            id: string;
            subject: string;
            status: import(".prisma/client").$Enums.SupportTicketStatus;
            user: {
                id: string;
                fullName: string;
                email: string;
            };
            messages: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    ticketDetail(id: string): Promise<{
        user: {
            id: string;
            fullName: string;
            email: string;
        };
        messages: {
            id: string;
            createdAt: Date;
            admin: {
                fullName: string;
            };
            senderRole: import(".prisma/client").$Enums.SupportSenderRole;
            message: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SupportTicketStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        subject: string;
    }>;
    setTicketStatus(admin: AdminIdentity, id: string, body: {
        status?: string;
    }): Promise<{
        success: boolean;
        status: "OPEN" | "PENDING_USER" | "PENDING_SUPPORT" | "CLOSED";
    }>;
    replyToTicket(admin: AdminIdentity, id: string, body: {
        message?: string;
        close?: boolean;
    }): Promise<{
        success: boolean;
        status: string;
        emailSent: boolean;
    }>;
    listAudit(query: PageQuery & {
        search?: string;
    }): Promise<{
        total: number;
        page: number;
        limit: number;
        pages: number;
        items: {
            id: string;
            action: string;
            targetType: string;
            targetId: string;
            description: string;
            admin: {
                fullName: string;
                role: import(".prisma/client").$Enums.AdminRole;
            };
            user: {
                fullName: string;
                email: string;
            };
            createdAt: Date;
        }[];
    }>;
    logTeamChange(admin: AdminIdentity, action: string, targetId: string, description: string): Prisma.Prisma__AuditLogClient<{
        id: string;
        createdAt: Date;
        userId: string | null;
        adminId: string | null;
        action: string;
        targetType: string;
        targetId: string | null;
        description: string | null;
        metadata: Prisma.JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
