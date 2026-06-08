"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let AuditLogsService = class AuditLogsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.auditLog.create({
            data: {
                userId: dto.userId,
                adminId: dto.adminId,
                action: dto.action,
                targetType: dto.targetType,
                targetId: dto.targetId,
                description: dto.description,
                metadata: dto.metadata,
                ipAddress: dto.ipAddress,
                userAgent: dto.userAgent,
            },
            include: this.includeRelations(),
        });
    }
    async findAll() {
        return this.prisma.auditLog.findMany({
            include: this.includeRelations(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const log = await this.prisma.auditLog.findUnique({
            where: { id },
            include: this.includeRelations(),
        });
        if (!log) {
            throw new common_1.NotFoundException('Audit log not found');
        }
        return log;
    }
    async findByUser(userId) {
        return this.prisma.auditLog.findMany({
            where: { userId },
            include: this.includeRelations(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findByAdmin(adminId) {
        return this.prisma.auditLog.findMany({
            where: { adminId },
            include: this.includeRelations(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findByTarget(targetType, targetId) {
        return this.prisma.auditLog.findMany({
            where: {
                targetType,
                targetId,
            },
            include: this.includeRelations(),
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    includeRelations() {
        return {
            user: {
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                },
            },
            admin: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                },
            },
        };
    }
};
exports.AuditLogsService = AuditLogsService;
exports.AuditLogsService = AuditLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogsService);
//# sourceMappingURL=audit-logs.service.js.map