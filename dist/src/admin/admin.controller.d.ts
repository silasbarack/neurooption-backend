import { AdminService } from './admin.service';
import { type AdminIdentity } from './admin-session.guard';
import { TradingMonitorService } from './trading-monitor.service';
import { AdminConsoleService } from './admin-console.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
type AdminReq = {
    admin: AdminIdentity;
};
export declare class AdminController {
    private readonly adminService;
    private readonly monitor;
    private readonly console;
    constructor(adminService: AdminService, monitor: TradingMonitorService, console: AdminConsoleService);
    login(dto: AdminLoginDto): Promise<{
        message: string;
        token: string;
        adminId: string;
        role: import(".prisma/client").$Enums.AdminRole;
        admin: {
            id: string;
            fullName: string;
            email: string;
            role: import(".prisma/client").$Enums.AdminRole;
        };
    }>;
    bootstrapStatus(): Promise<{
        available: boolean;
        mode?: "create" | "reset";
    }>;
    bootstrapFirstAdmin(body: {
        fullName?: string;
        email?: string;
        password?: string;
        setupKey?: string;
    }): Promise<{
        success: boolean;
        message: string;
        role: import(".prisma/client").$Enums.AdminRole;
    }>;
    bootstrapResetPassword(body: {
        email?: string;
        password?: string;
        setupKey?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    session(req: {
        admin: AdminIdentity;
    }): {
        admin: AdminIdentity;
        permissions: ("overview" | "users" | "userStatus" | "kyc" | "finance" | "trading" | "support" | "audit" | "emails" | "team")[];
    };
    tradingMonitor(req: {
        admin: AdminIdentity;
    }, query: {
        account?: string;
        status?: string;
        search?: string;
        page?: string;
        limit?: string;
    }): Promise<{
        generatedAt: string;
        period: string;
        account: string;
        stats: {
            trades24: number;
            openTrades: number;
            volumeUsd24: number;
            wins24: number;
            losses24: number;
            winRate24: number;
            activeClients24: number;
        };
        activity: {
            hour: string;
            trades: number;
            volumeUsd: number;
        }[];
        activitySampled: boolean;
        trades: {
            total: number;
            page: number;
            limit: number;
            pages: number;
            items: {
                id: string;
                userId: string;
                clientName: string;
                clientEmail: string;
                asset: string;
                side: string;
                status: string;
                accountType: string;
                currency: string;
                stakeAmount: number;
                stakeUsd: number;
                payoutPercent: number;
                profitUsd: number;
                entryTime: string;
                expiryTime: string;
            }[];
        };
    }>;
    overview(req: AdminReq): Promise<{
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
    users(req: AdminReq, query: Record<string, string>): Promise<{
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
    user(req: AdminReq, id: string): Promise<{
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
            asset: string;
            accountType: string;
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
            rejectionReason: string;
            currency: string;
        }[];
        kyc: {
            id: string;
            status: import(".prisma/client").$Enums.KycStatus;
            createdAt: Date;
            documentType: string;
            rejectionReason: string;
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
    userStatus(req: AdminReq, id: string, body: {
        status?: string;
        reason?: string;
    }): Promise<{
        success: boolean;
        status: "ACTIVE" | "SUSPENDED" | "LOCKED";
    }>;
    kyc(req: AdminReq, query: Record<string, string>): Promise<{
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
    reviewKyc(req: AdminReq, id: string, body: {
        decision?: string;
        reason?: string;
    }): Promise<{
        success: boolean;
        status: string;
        emailSent: boolean;
    }>;
    finance(req: AdminReq, query: Record<string, string>): Promise<{
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
    tickets(req: AdminReq, query: Record<string, string>): Promise<{
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
    ticket(req: AdminReq, id: string): Promise<{
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
    ticketStatus(req: AdminReq, id: string, body: {
        status?: string;
    }): Promise<{
        success: boolean;
        status: "OPEN" | "PENDING_USER" | "PENDING_SUPPORT" | "CLOSED";
    }>;
    replyTicket(req: AdminReq, id: string, body: {
        message?: string;
        close?: boolean;
    }): Promise<{
        success: boolean;
        status: string;
        emailSent: boolean;
    }>;
    emailLog(req: AdminReq, query: Record<string, string>): Promise<{
        total: number;
        page: number;
        limit: number;
        pages: number;
        items: {
            id: string;
            status: import(".prisma/client").$Enums.EmailStatus;
            createdAt: Date;
            subject: string;
            kind: string;
            recipient: string;
            provider: string;
            attempts: number;
            nextAttemptAt: Date;
            lastError: string;
            lastEvent: string;
            acceptedAt: Date;
            deliveredAt: Date;
        }[];
        last24h: {
            [k: string]: number;
        };
    }>;
    emailHealth(req: AdminReq): Promise<{
        provider: "brevo" | "resend" | "smtp" | "none";
        sender: string;
        linksPointTo: string;
        warnings: string[];
        brevo: {
            keyValid: boolean;
            domain: string;
            authenticated: boolean | null;
        };
        webhookConfigured: boolean;
    }>;
    emailTest(req: AdminReq, body: {
        to?: string;
    }): Promise<{
        accepted: boolean;
        message: string;
    }>;
    auditLog(req: AdminReq, query: Record<string, string>): Promise<{
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
    create(req: AdminReq, dto: CreateAdminDto): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    update(req: AdminReq, id: string, dto: UpdateAdminDto): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    disable(req: AdminReq, id: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    enable(req: AdminReq, id: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    delete(req: AdminReq, id: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
}
export {};
