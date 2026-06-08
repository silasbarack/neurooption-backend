import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../config/prisma.service';

import { CreateKycDto } from './dto/create-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

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

    return this.prisma.kycRecord.create({
      data: {
        userId: dto.userId,
        documentType: dto.documentType!,
        documentNumber: dto.documentNumber!,
      },
    });
  }

  async findAll() {
    return this.prisma.kycRecord.findMany({
      include: {
        user: true,
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
          user: true,
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

    return updated;
  }

  async pending() {
    return this.prisma.kycRecord.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        user: true,
      },
    });
  }
}