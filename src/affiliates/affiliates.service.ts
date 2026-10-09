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

import { lockActiveUser } from '../common/lock-active-user';
import { serializableTransaction } from '../common/serializable-transaction';
import { PrismaService } from '../config/prisma.service';
import { CreateAffiliateCommissionDto } from './dto/create-affiliate-commission.dto';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { UpdateCommissionStatusDto } from './dto/update-commission-status.dto';

@Injectable()
export class AffiliatesService {
  constructor(private readonly prisma: PrismaService) {}

  async createAffiliate(dto: CreateAffiliateDto) {
    return serializableTransaction(this.prisma, async (tx) => {
      await lockActiveUser(tx, dto.userId);
      const user = await tx.user.findUnique({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingAffiliate = await tx.affiliate.findUnique({
        where: { userId: dto.userId },
      });

      if (existingAffiliate) {
        throw new ConflictException('User already has an affiliate profile');
      }

      const existingCode = await tx.affiliate.findUnique({
        where: { code: dto.code },
      });

      if (existingCode) {
        throw new ConflictException('Affiliate code already exists');
      }

      const commissionRate = new Prisma.Decimal(dto.commissionPercentage ?? 10).div(100);

      return tx.affiliate.create({
        data: {
          userId: dto.userId,
          code: dto.code,
          status: AffiliateStatus.ACTIVE,
          commissionRate,
        },
        include: this.affiliateInclude(),
      });
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
    const owner = await this.findAffiliateById(id);
    return serializableTransaction(this.prisma, async (tx) => {
      await lockActiveUser(tx, owner.userId);
      const data: Prisma.AffiliateUpdateInput = {};
      if (dto.status !== undefined) data.status = dto.status;
      if (dto.commissionPercentage !== undefined) {
        data.commissionRate = new Prisma.Decimal(dto.commissionPercentage).div(100);
      }
      return tx.affiliate.update({ where: { id }, data, include: this.affiliateInclude() });
    });
  }

  async createCommission(dto: CreateAffiliateCommissionDto) {
    const owner = await this.prisma.affiliate.findUnique({ where: { id: dto.affiliateId } });
    if (!owner) throw new NotFoundException('Affiliate not found');
    if (owner.userId !== dto.affiliateUserId) throw new BadRequestException('Affiliate does not belong to this user');

    return serializableTransaction(this.prisma, async (tx) => {
      await lockActiveUser(tx, owner.userId);
      const affiliate = await tx.affiliate.findUnique({ where: { id: owner.id } });
      if (!affiliate || affiliate.status !== AffiliateStatus.ACTIVE) {
        throw new BadRequestException('Affiliate is not active');
      }
      const rate = new Prisma.Decimal(dto.commissionPercentage).div(100);
      return tx.affiliateCommission.create({
        data: {
          affiliateId: affiliate.id, affiliateUserId: affiliate.userId,
          referredUserId: dto.referredUserId, transactionId: dto.transactionId,
          amount: new Prisma.Decimal(dto.amount).mul(rate), rate,
          status: CommissionStatus.PENDING, description: dto.description,
        },
        include: this.commissionInclude(),
      });
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

  async updateCommissionStatus(id: string, dto: UpdateCommissionStatusDto) {
    const commission = await this.prisma.affiliateCommission.findUnique({ where: { id } });
    if (!commission) throw new NotFoundException('Affiliate commission not found');
    return serializableTransaction(this.prisma, async (tx) => {
      if (dto.status === CommissionStatus.PENDING || dto.status === CommissionStatus.APPROVED) {
        await lockActiveUser(tx, commission.affiliateUserId);
      }
      return tx.affiliateCommission.update({
        where: { id },
        data: { status: dto.status, paidAt: dto.status === CommissionStatus.PAID ? new Date() : null },
        include: this.commissionInclude(),
      });
    });
  }

  async payCommission(id: string, walletId: string) {
    const owner = await this.prisma.affiliateCommission.findUnique({ where: { id } });
    if (!owner) throw new NotFoundException('Affiliate commission not found');
    return serializableTransaction(this.prisma, async (tx) => {
      await lockActiveUser(tx, owner.affiliateUserId);
      const commission = await tx.affiliateCommission.findUnique({ where: { id } });
      if (!commission) throw new NotFoundException('Affiliate commission not found');
      if (commission.status === CommissionStatus.PAID) throw new BadRequestException('Commission already paid');
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet || wallet.userId !== commission.affiliateUserId) {
        throw new BadRequestException('Wallet does not belong to the affiliate user');
      }
      const transaction = await tx.transaction.create({
        data: {
          userId: commission.affiliateUserId, walletId, type: TransactionType.AFFILIATE_COMMISSION,
          status: TransactionStatus.COMPLETED, amount: commission.amount,
          reference: 'AFF_COM_' + commission.id, description: 'Affiliate commission paid',
        },
      });
      await tx.wallet.update({ where: { id: walletId }, data: { balance: { increment: commission.amount } } });
      await tx.affiliate.update({
        where: { id: commission.affiliateId },
        data: { totalEarned: { increment: commission.amount }, totalPaid: { increment: commission.amount } },
      });
      return tx.affiliateCommission.update({
        where: { id },
        data: { status: CommissionStatus.PAID, transactionId: transaction.id, paidAt: new Date() },
        include: this.commissionInclude(),
      });
    });
  }

  private affiliateInclude() {
    return {
      user: {
        select: {
          id: true,
          fullName: true,
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
          fullName: true,
          email: true,
          phone: true,
        },
      },
      referredUser: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
      transaction: true,
    };
  }
}