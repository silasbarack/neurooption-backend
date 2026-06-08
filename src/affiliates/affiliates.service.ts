import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AffiliateStatus,
  CommissionStatus,
  Prisma,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

import { PrismaService } from '../config/prisma.service';
import { CreateAffiliateCommissionDto } from './dto/create-affiliate-commission.dto';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';

@Injectable()
export class AffiliatesService {
  constructor(private readonly prisma: PrismaService) {}

  async createAffiliate(dto: CreateAffiliateDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingAffiliate = await this.prisma.affiliate.findUnique({
      where: { userId: dto.userId },
    });

    if (existingAffiliate) {
      throw new ConflictException('User already has an affiliate profile');
    }

    const existingCode = await this.prisma.affiliate.findUnique({
      where: { code: dto.code },
    });

    if (existingCode) {
      throw new ConflictException('Affiliate code already exists');
    }

    const commissionRate = new Prisma.Decimal(dto.commissionPercentage ?? 10).div(100);

    return this.prisma.affiliate.create({
      data: {
        userId: dto.userId,
        code: dto.code,
        status: AffiliateStatus.ACTIVE,
        commissionRate,
      },
      include: this.affiliateInclude(),
    });
  }

  async findAllAffiliates() {
    return this.prisma.affiliate.findMany({
      include: this.affiliateInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAffiliateById(id: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { id },
      include: this.affiliateInclude(),
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    return affiliate;
  }

  async findAffiliateByUser(userId: string) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { userId },
      include: this.affiliateInclude(),
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    return affiliate;
  }

  async updateAffiliate(id: string, dto: UpdateAffiliateDto) {
    await this.findAffiliateById(id);

    const data: any = {};

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    if (dto.commissionPercentage !== undefined) {
      data.commissionRate = new Prisma.Decimal(dto.commissionPercentage).div(100);
    }

    return this.prisma.affiliate.update({
      where: { id },
      data,
      include: this.affiliateInclude(),
    });
  }

  async createCommission(dto: CreateAffiliateCommissionDto) {
    const affiliate = await this.prisma.affiliate.findUnique({
      where: { id: dto.affiliateId },
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    if (affiliate.status !== AffiliateStatus.ACTIVE) {
      throw new BadRequestException('Affiliate is not active');
    }

    const amount = new Prisma.Decimal(dto.amount);
    const rate = new Prisma.Decimal(dto.commissionPercentage).div(100);
    const commissionAmount = amount.mul(rate);

    return this.prisma.affiliateCommission.create({
      data: {
        affiliateId: dto.affiliateId,
        affiliateUserId: dto.affiliateUserId,
        referredUserId: dto.referredUserId,
        transactionId: dto.transactionId,
        amount: commissionAmount,
        rate,
        status: CommissionStatus.PENDING,
        description: dto.description,
      },
      include: this.commissionInclude(),
    });
  }

  async findAllCommissions() {
    return this.prisma.affiliateCommission.findMany({
      include: this.commissionInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findCommissionsByAffiliate(affiliateId: string) {
    return this.prisma.affiliateCommission.findMany({
      where: { affiliateId },
      include: this.commissionInclude(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateCommissionStatus(
    id: string,
    dto: UpdateCommissionStatusDto,
  ) {
    const commission = await this.prisma.affiliateCommission.findUnique({
      where: { id },
    });

    if (!commission) {
      throw new NotFoundException('Affiliate commission not found');
    }

    return this.prisma.affiliateCommission.update({
      where: { id },
      data: {
        status: dto.status,
        paidAt: dto.status === CommissionStatus.PAID ? new Date() : null,
      },
      include: this.commissionInclude(),
    });
  }

  async payCommission(id: string, walletId: string) {
    const commission = await this.prisma.affiliateCommission.findUnique({
      where: { id },
      include: {
        affiliateUser: true,
      },
    });

    if (!commission) {
      throw new NotFoundException('Affiliate commission not found');
    }

    if (commission.status === CommissionStatus.PAID) {
      throw new BadRequestException('Commission already paid');
    }

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: commission.affiliateUserId,
          walletId,
          type: TransactionType.AFFILIATE_COMMISSION,
          status: TransactionStatus.COMPLETED,
          amount: commission.amount,
          reference: `AFF_COM_${commission.id}`,
          description: `Affiliate commission paid`,
        },
      });

      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: {
            increment: commission.amount,
          },
        },
      });

      await tx.affiliate.update({
        where: { id: commission.affiliateId },
        data: {
          totalEarned: {
            increment: commission.amount,
          },
          totalPaid: {
            increment: commission.amount,
          },
        },
      });

      return tx.affiliateCommission.update({
        where: { id },
        data: {
          status: CommissionStatus.PAID,
          transactionId: transaction.id,
          paidAt: new Date(),
        },
        include: this.commissionInclude(),
      });
    });
  }

  private affiliateInclude() {
    return {
      user: {
        select: {
          id: true,
          fullname: true,
          email: true,
          phone: true,
        },
      },
      commissions: true,
    };
  }

  private commissionInclude() {
    return {
      affiliate: true,
      affiliateUser: {
        select: {
          id: true,
          fullname: true,
          email: true,
          phone: true,
        },
      },
      referredUser: {
        select: {
          id: true,
          fullname: true,
          email: true,
          phone: true,
        },
      },
      transaction: true,
    };
  }
}