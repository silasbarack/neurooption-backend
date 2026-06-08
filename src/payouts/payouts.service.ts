import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

import { PrismaService } from '../config/prisma.service';
import { CalculatePayoutDto } from './dto/calculate-payout.dto';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdateAssetPayoutDto } from './dto/update-asset-payout.dto';

@Injectable()
export class PayoutsService {
  private readonly minPayoutRate = new Prisma.Decimal(0.20);
  private readonly maxPayoutRate = new Prisma.Decimal(0.92);

  constructor(private readonly prisma: PrismaService) {}

  async calculateExpectedPayout(dto: CalculatePayoutDto) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (!asset.isActive) {
      throw new BadRequestException('Asset is not active');
    }

    const payoutRate = this.validatePayoutRate(asset.payoutRate);
    const stakeAmount = new Prisma.Decimal(dto.stakeAmount);

    const expectedProfit = stakeAmount.mul(payoutRate);
    const expectedReturn = stakeAmount.plus(expectedProfit);

    return {
      assetId: asset.id,
      symbol: asset.symbol,
      marketType: asset.marketType,
      stakeAmount: Number(stakeAmount.toFixed(2)),
      payoutPercentage: Number(payoutRate.mul(100).toFixed(2)),
      expectedProfit: Number(expectedProfit.toFixed(2)),
      expectedReturn: Number(expectedReturn.toFixed(2)),
      message: 'Expected profit applies only if the trade wins',
    };
  }

  async updateAssetPayout(dto: UpdateAssetPayoutDto) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const payoutRate = new Prisma.Decimal(dto.payoutPercentage).div(100);

    this.validatePayoutRate(payoutRate);

    return this.prisma.asset.update({
      where: { id: dto.assetId },
      data: {
        payoutRate,
      },
    });
  }

  async create(dto: CreatePayoutDto) {
    const amount = new Prisma.Decimal(dto.amount);

    return this.prisma.payout.create({
      data: {
        userId: dto.userId,
        walletId: dto.walletId,
        gatewayId: dto.gatewayId,
        transactionId: dto.transactionId,
        tradeId: dto.tradeId,
        amount,
        currency: dto.currency ?? 'KES',
        status: dto.status ?? TransactionStatus.PENDING,
      },
      include: this.includeRelations(),
    });
  }

  async createTradeWinPayout(params: {
    userId: string;
    walletId: string;
    tradeId: string;
    stakeAmount: Prisma.Decimal;
    payoutRate: Prisma.Decimal;
    currency?: string;
  }) {
    const payoutRate = this.validatePayoutRate(params.payoutRate);

    const profit = params.stakeAmount.mul(payoutRate);
    const totalPayout = params.stakeAmount.plus(profit);

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: params.userId,
          walletId: params.walletId,
          type: TransactionType.TRADE_PROFIT,
          status: TransactionStatus.COMPLETED,
          amount: totalPayout,
          reference: `PAYOUT_${params.tradeId}`,
          description: `Trade payout. Stake plus profit for trade ${params.tradeId}`,
        },
      });

      await tx.wallet.update({
        where: { id: params.walletId },
        data: {
          balance: {
            increment: totalPayout,
          },
        },
      });

      return tx.payout.create({
        data: {
          userId: params.userId,
          walletId: params.walletId,
          transactionId: transaction.id,
          tradeId: params.tradeId,
          amount: totalPayout,
          currency: params.currency ?? 'KES',
          status: TransactionStatus.COMPLETED,
        },
        include: this.includeRelations(),
      });
    });
  }

  async findAll() {
    return this.prisma.payout.findMany({
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.payout.findMany({
      where: { userId },
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByTrade(tradeId: string) {
    return this.prisma.payout.findMany({
      where: { tradeId },
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: this.includeRelations(),
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return payout;
  }

  private validatePayoutRate(rate: Prisma.Decimal) {
    if (rate.lessThan(this.minPayoutRate)) {
      throw new BadRequestException('Minimum payout is 20%');
    }

    if (rate.greaterThan(this.maxPayoutRate)) {
      throw new BadRequestException('Maximum payout is 92%');
    }

    return rate;
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
      wallet: true,
      gateway: true,
      transaction: true,
      trade: true,
    };
  }
}