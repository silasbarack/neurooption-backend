import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  NotificationChannel,
  NotificationStatus,
} from '@prisma/client';

import { PrismaService } from '../common/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationStatusDto } from './dto/update-notification-status.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification =
      await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          type: dto.type,
          channel: dto.channel || NotificationChannel.EMAIL,
          subject: dto.subject,
          body: dto.body,
          recipientEmail: dto.recipientEmail,
          transactionId: dto.transactionId,
          kycRecordId: dto.kycRecordId,
          supportTicketId: dto.supportTicketId,
          status: NotificationStatus.CREATED,
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

  async findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const notification =
      await this.prisma.notification.findUnique({
        where: {
          id,
        },
      });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsSent(id: string) {
    await this.findOne(id);

    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      },
    });
  }

  async markAsFailed(id: string) {
    await this.findOne(id);

    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        status: NotificationStatus.FAILED,
      },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateNotificationStatusDto,
  ) {
    await this.findOne(id);

    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        status: dto.status,
        sentAt:
          dto.status === NotificationStatus.SENT
            ? new Date()
            : undefined,
      },
    });
  }
}