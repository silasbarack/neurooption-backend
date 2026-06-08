import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  SupportTicketStatus,
} from '@prisma/client';

import { PrismaService } from '../config/prisma.service';

import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createTicket(
    dto: CreateSupportTicketDto,
  ) {
    return this.prisma.supportTicket.create({
      data: {
        userId: dto.userId,
        subject: dto.subject,
        status: SupportTicketStatus.OPEN,
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

  async getUserTickets(
    userId: string,
  ) {
    return this.prisma.supportTicket.findMany({
      where: {
        userId,
      },
      include: {
        messages: true,
      },
    });
  }

  async getTicket(
    id: string,
  ) {
    const ticket =
      await this.prisma.supportTicket.findUnique({
        where: { id },
        include: {
          user: true,
          messages: true,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        'Ticket not found',
      );
    }

    return ticket;
  }

  async sendMessage(
    dto: CreateSupportMessageDto,
  ) {
    return this.prisma.supportMessage.create({
      data: {
        ticketId: dto.ticketId,
        senderId: dto.senderId,
        senderRole: dto.senderRole,
        message: dto.message,
      },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateSupportTicketStatusDto,
  ) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }

  async resolveTicket(id: string) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        status:
          SupportTicketStatus.CLOSED,
      },
    });
  }

  async closeTicket(id: string) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        status:
          SupportTicketStatus.CLOSED,
      },
    });
  }
}