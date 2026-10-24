import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Optional,
} from '@nestjs/common';

import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';

import { CreateKycDto } from './dto/create-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly emails?: EmailsService,
  ) {}

  /** Emails the client about their KYC status after the change is saved. Never throws. */
  private async notify(userId: string, recordId: string, status: 'SUBMITTED' | 'APPROVED' | 'REJECTED', reason?: string) {
    if (!this.emails) return;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, fullName: true, status: true } });
    if (!user || user.status === 'DELETED') return;
    const options = { userId, dedupeKey: `kyc-${status.toLowerCase()}:${recordId}` };
    try {
      if (status === 'SUBMITTED') await this.emails.sendKycSubmittedEmail(user.email, user.fullName, options);
      else if (status === 'APPROVED') await this.emails.sendKycApprovedEmail(user.email, user.fullName, options);
      else await this.emails.sendKycRejectedEmail(user.email, user.fullName, reason || 'The documents could not be verified.', options);
    } catch {
      // Delivery problems are recorded by EmailsService; the KYC change stands.
    }
  }

  async submit(dto: CreateKycDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const record = await this.prisma.kycRecord.create({
      data: {
        userId: dto.userId,
        documentType: dto.documentType!,
        documentNumber: dto.documentNumber!,
      },
    });
    await this.notify(dto.userId, record.id, 'SUBMITTED');
    return record;
  }

  async findAll() {
    return this.prisma.kycRecord.findMany({
      include: {
        user: { select: { id: true, fullName: true, email: true, status: true, kycStatus: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const record =
      await this.prisma.kycRecord.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, fullName: true, email: true, status: true, kycStatus: true } },
        },
      });

    if (!record) {
      throw new NotFoundException(
        'KYC record not found',
      );
    }

    return record;
  }

  async approve(
    id: string,
    dto: ReviewKycDto,
  ) {
    const record =
      await this.prisma.kycRecord.findUnique({
        where: { id },
      });

    if (!record) {
      throw new NotFoundException(
        'KYC record not found',
      );
    }

    const updated =
      await this.prisma.kycRecord.update({
        where: { id },
        data: {
          status: 'APPROVED',
          rejectionReason: null,
        },
      });

    await this.prisma.user.update({
      where: {
        id: record.userId,
      },
      data: {
        kycStatus: 'APPROVED',
      },
    });

    await this.notify(record.userId, id, 'APPROVED');
    return updated;
  }

  async reject(
    id: string,
    dto: ReviewKycDto,
  ) {
    if (!dto.rejectionReason) {
      throw new BadRequestException(
        'Rejection reason required',
      );
    }

    const record =
      await this.prisma.kycRecord.findUnique({
        where: { id },
      });

    if (!record) {
      throw new NotFoundException(
        'KYC record not found',
      );
    }

    const updated =
      await this.prisma.kycRecord.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason:
            dto.rejectionReason,
        },
      });

    await this.prisma.user.update({
      where: {
        id: record.userId,
      },
      data: {
        kycStatus: 'REJECTED',
      },
    });

    await this.notify(record.userId, id, 'REJECTED', dto.rejectionReason);
    return updated;
  }

  async pending() {
    return this.prisma.kycRecord.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, status: true, kycStatus: true } },
      },
    });
  }
}