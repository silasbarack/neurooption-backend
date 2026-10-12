import { AdminService } from './admin.service';
import { type AdminIdentity } from './admin-session.guard';
import { TradingMonitorService } from './trading-monitor.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
export declare class AdminController {
    private readonly adminService;
    private readonly monitor;
    constructor(adminService: AdminService, monitor: TradingMonitorService);
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
    create(dto: CreateAdminDto): Promise<{
        id: string;
        email: string;
        phone: string;
        fullName: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        phone: string;
        fullName: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        phone: string;
        fullName: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateAdminDto): Promise<{
        id: string;
        email: string;
        phone: string;
        fullName: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    disable(id: string): Promise<{
        id: string;
        email: string;
        phone: string;
        fullName: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    enable(id: string): Promise<{
        id: string;
        email: string;
        phone: string;
        fullName: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
    delete(id: string): Promise<{
        id: string;
        email: string;
        phone: string;
        fullName: string;
        role: import(".prisma/client").$Enums.AdminRole;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
    }>;
}
