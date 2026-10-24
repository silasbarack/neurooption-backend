import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupportTicketStatus } from '@prisma/client';

import { PrismaService } from '../config/prisma.service';

const MAX_SUBJECT = 120;
const MAX_MESSAGE = 4000;

/** A client-facing view of one message: who wrote it, never staff identities. */
const MESSAGE_SELECT = { id: true, senderRole: true, message: true, createdAt: true } as const;

function text(value: unknown, label: string, max: number, min = 1): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (trimmed.length < min) throw new BadRequestException(`${label} is required.`);
  if (trimmed.length > max) throw new BadRequestException(`${label} is too long (${max} characters max).`);
  return trimmed;
}

/** Support tickets as seen by the signed-in client; every query is scoped to their own user id. */
@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(userId: string) {
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

  async getMine(userId: string, id: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 200, select: MESSAGE_SELECT } },
    });
    if (!ticket) throw new NotFoundException('Ticket not found.');
    return { id: ticket.id, subject: ticket.subject, status: ticket.status, createdAt: ticket.createdAt, updatedAt: ticket.updatedAt, messages: ticket.messages };
  }

  async create(userId: string, body: { subject?: unknown; message?: unknown }) {
    const subject = text(body?.subject, 'Subject', MAX_SUBJECT, 3);
    const message = text(body?.message, 'Message', MAX_MESSAGE, 2);
    const open = await this.prisma.supportTicket.count({ where: { userId, status: { not: SupportTicketStatus.CLOSED } } });
    if (open >= 10) throw new BadRequestException('You already have 10 open tickets. Please continue in one of them.');
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        subject,
        status: SupportTicketStatus.PENDING_SUPPORT,
        messages: { create: { senderId: userId, senderRole: 'USER', message } },
      },
    });
    return this.getMine(userId, ticket.id);
  }

  async reply(userId: string, id: string, body: { message?: unknown }) {
    const message = text(body?.message, 'Message', MAX_MESSAGE, 1);
    const ticket = await this.prisma.supportTicket.findFirst({ where: { id, userId }, select: { id: true } });
    if (!ticket) throw new NotFoundException('Ticket not found.');
    // Writing again reopens a closed ticket and puts it back in the support queue.
    await this.prisma.$transaction([
      this.prisma.supportMessage.create({ data: { ticketId: id, senderId: userId, senderRole: 'USER', message } }),
      this.prisma.supportTicket.update({ where: { id }, data: { status: SupportTicketStatus.PENDING_SUPPORT } }),
    ]);
    return this.getMine(userId, id);
  }
}
