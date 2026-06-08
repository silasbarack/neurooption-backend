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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../common/prisma.service");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: dto.userId,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const notification = await this.prisma.notification.create({
            data: {
                userId: dto.userId,
                type: dto.type,
                channel: dto.channel || client_1.NotificationChannel.EMAIL,
                subject: dto.subject,
                body: dto.body,
                recipientEmail: dto.recipientEmail,
                transactionId: dto.transactionId,
                kycRecordId: dto.kycRecordId,
                supportTicketId: dto.supportTicketId,
                status: client_1.NotificationStatus.CREATED,
            },
        });
        return {
            message: 'Notification created successfully',
            notification,
        };
    }
    async findAll() {
        return this.prisma.notification.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findByUser(userId) {
        return this.prisma.notification.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const notification = await this.prisma.notification.findUnique({
            where: {
                id,
            },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return notification;
    }
    async markAsSent(id) {
        await this.findOne(id);
        return this.prisma.notification.update({
            where: {
                id,
            },
            data: {
                status: client_1.NotificationStatus.SENT,
                sentAt: new Date(),
            },
        });
    }
    async markAsFailed(id) {
        await this.findOne(id);
        return this.prisma.notification.update({
            where: {
                id,
            },
            data: {
                status: client_1.NotificationStatus.FAILED,
            },
        });
    }
    async updateStatus(id, dto) {
        await this.findOne(id);
        return this.prisma.notification.update({
            where: {
                id,
            },
            data: {
                status: dto.status,
                sentAt: dto.status === client_1.NotificationStatus.SENT
                    ? new Date()
                    : undefined,
            },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map