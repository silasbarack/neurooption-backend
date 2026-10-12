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
const MAX_SUBJECT = 120;
const MAX_MESSAGE = 4000;
const MESSAGE_SELECT = { id: true, senderRole: true, message: true, createdAt: true };
function text(value, label, max, min = 1) {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (trimmed.length < min)
        throw new common_1.BadRequestException(`${label} is required.`);
    if (trimmed.length > max)
        throw new common_1.BadRequestException(`${label} is too long (${max} characters max).`);
    return trimmed;
}
let SupportService = class SupportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listMine(userId) {
        const tickets = await this.prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 50,
            include: {
                messages: { orderBy: { createdAt: 'desc' }, take: 1, select: MESSAGE_SELECT },
                _count: { select: { messages: true } },
            },
        });
        return tickets.map((t) => ({
            id: t.id,
            subject: t.subject,
            status: t.status,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            messages: t._count.messages,
            lastMessage: t.messages[0] ?? null,
        }));
    }
    async getMine(userId, id) {
        const ticket = await this.prisma.supportTicket.findFirst({
            where: { id, userId },
            include: { messages: { orderBy: { createdAt: 'asc' }, take: 200, select: MESSAGE_SELECT } },
        });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found.');
        return { id: ticket.id, subject: ticket.subject, status: ticket.status, createdAt: ticket.createdAt, updatedAt: ticket.updatedAt, messages: ticket.messages };
    }
    async create(userId, body) {
        const subject = text(body?.subject, 'Subject', MAX_SUBJECT, 3);
        const message = text(body?.message, 'Message', MAX_MESSAGE, 2);
        const open = await this.prisma.supportTicket.count({ where: { userId, status: { not: client_1.SupportTicketStatus.CLOSED } } });
        if (open >= 10)
            throw new common_1.BadRequestException('You already have 10 open tickets. Please continue in one of them.');
        const ticket = await this.prisma.supportTicket.create({
            data: {
                userId,
                subject,
                status: client_1.SupportTicketStatus.PENDING_SUPPORT,
                messages: { create: { senderId: userId, senderRole: 'USER', message } },
            },
        });
        return this.getMine(userId, ticket.id);
    }
    async reply(userId, id, body) {
        const message = text(body?.message, 'Message', MAX_MESSAGE, 1);
        const ticket = await this.prisma.supportTicket.findFirst({ where: { id, userId }, select: { id: true } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found.');
        await this.prisma.$transaction([
            this.prisma.supportMessage.create({ data: { ticketId: id, senderId: userId, senderRole: 'USER', message } }),
            this.prisma.supportTicket.update({ where: { id }, data: { status: client_1.SupportTicketStatus.PENDING_SUPPORT } }),
        ]);
        return this.getMine(userId, id);
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportService);
//# sourceMappingURL=support.service.js.map