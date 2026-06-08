import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    create(dto: CreateAuditLogDto): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        } | null;
        admin: {
            id: string;
            fullName: string;
            email: string;
            role: import(".prisma/client").$Enums.AdminRole;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        adminId: string | null;
        action: string;
        targetType: string;
        targetId: string | null;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        } | null;
        admin: {
            id: string;
            fullName: string;
            email: string;
            role: import(".prisma/client").$Enums.AdminRole;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        adminId: string | null;
        action: string;
        targetType: string;
        targetId: string | null;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        } | null;
        admin: {
            id: string;
            fullName: string;
            email: string;
            role: import(".prisma/client").$Enums.AdminRole;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        adminId: string | null;
        action: string;
        targetType: string;
        targetId: string | null;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    findByUser(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        } | null;
        admin: {
            id: string;
            fullName: string;
            email: string;
            role: import(".prisma/client").$Enums.AdminRole;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        adminId: string | null;
        action: string;
        targetType: string;
        targetId: string | null;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    })[]>;
    findByAdmin(adminId: string): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        } | null;
        admin: {
            id: string;
            fullName: string;
            email: string;
            role: import(".prisma/client").$Enums.AdminRole;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        adminId: string | null;
        action: string;
        targetType: string;
        targetId: string | null;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    })[]>;
    findByTarget(targetType: string, targetId: string): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            fullname: never;
        } | null;
        admin: {
            id: string;
            fullName: string;
            email: string;
            role: import(".prisma/client").$Enums.AdminRole;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        adminId: string | null;
        action: string;
        targetType: string;
        targetId: string | null;
        description: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    })[]>;
}
