export declare class CreateAuditLogDto {
    userId?: string;
    adminId?: string;
    action: string;
    targetType: string;
    targetId?: string;
    description?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
