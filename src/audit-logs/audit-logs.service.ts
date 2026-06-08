import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../config/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAuditLogDto) {
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

  async findOne(id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: this.includeRelations(),
    });

    if (!log) {
      throw new NotFoundException('Audit log not found');
    }

    return log;
  }

  async findByUser(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByAdmin(adminId: string) {
    return this.prisma.auditLog.findMany({
      where: { adminId },
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByTarget(targetType: string, targetId: string) {
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

  private includeRelations() {
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
}