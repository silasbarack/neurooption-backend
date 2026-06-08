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
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
let SupportService = class SupportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTicket(dto) {
        return this.prisma.supportTicket.create({
            data: {
                userId: dto.userId,
                subject: dto.subject,
                status: client_1.SupportTicketStatus.OPEN,
            },
            include: {
                user: true,
                messages: true,
            },
        });
    }
    async getTickets() {
        return this.prisma.supportTicket.findMany({
            include: {
                user: true,
                messages: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getUserTickets(userId) {
        return this.prisma.supportTicket.findMany({
            where: {
                userId,
            },
            include: {
                messages: true,
            },
        });
    }
    async getTicket(id) {
        const ticket = await this.prisma.supportTicket.findUnique({
            where: { id },
            include: {
                user: true,
                messages: true,
            },
        });
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        return ticket;
    }
    async sendMessage(dto) {
        return this.prisma.supportMessage.create({
            data: {
                ticketId: dto.ticketId,
                senderId: dto.senderId,
                senderRole: dto.senderRole,
                message: dto.message,
            },
        });
    }
    async updateStatus(id, dto) {
        return this.prisma.supportTicket.update({
            where: { id },
            data: {
                status: dto.status,
            },
        });
    }
    async resolveTicket(id) {
        return this.prisma.supportTicket.update({
            where: { id },
            data: {
                status: client_1.SupportTicketStatus.CLOSED,
            },
        });
    }
    async closeTicket(id) {
        return this.prisma.supportTicket.update({
            where: { id },
            data: {
                status: client_1.SupportTicketStatus.CLOSED,
            },
        });
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportService);
//# sourceMappingURL=support.service.js.map