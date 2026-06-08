import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  TradeDirection,
  TradeStatus,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

import { PrismaService } from '../config/prisma.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { SettleTradeDto } from './dto/settle-trade.dto';
import { TradeQueryDto } from './dto/trade-query.dto';

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTradeDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: {
        wallets: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wallet = user.wallets.find((item) => item.currency === 'KES');

    if (!wallet) {
      throw new NotFoundException('KES wallet not found');
    }

    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (!asset.isActive) {
      throw new BadRequestException('Asset is not active');
    }

    if (dto.expiryId) {
      const expiry = await this.prisma.expiry.findUnique({
        where: { id: dto.expiryId },
      });

      if (!expiry) {
        throw new NotFoundException('Expiry not found');
      }

      if (!expiry.isActive) {
        throw new BadRequestException('Expiry is not active');
      }
    }

    const stakeAmount = new Prisma.Decimal(dto.stakeAmount);

    if (wallet.balance.lessThan(stakeAmount)) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const expiresAt = new Date(dto.expiresAt);

    if (expiresAt <= new Date()) {
      throw new BadRequestException('Expiry time must be in the future');
    }

    return this.prisma.$transaction(async (tx) => {
      const trade = await tx.trade.create({
        data: {
          userId: dto.userId,
          assetId: dto.assetId,
          expiryId: dto.expiryId,
          direction: dto.direction,
          status: TradeStatus.OPEN,
          stakeAmount,
          payoutRate: asset.payoutRate,
          entryPrice: new Prisma.Decimal(dto.entryPrice),
          expiresAt,
        },
        include: this.includeRelations(),
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: stakeAmount,
          },
          locked: {
            increment: stakeAmount,
          },
        },
      });

      await tx.transaction.create({
        data: {
          userId: dto.userId,
          walletId: wallet.id,
          type: TransactionType.TRADE_STAKE,
          status: TransactionStatus.COMPLETED,
          amount: stakeAmount,
          reference: `TRADE_STAKE_${trade.id}`,
          description: `Stake placed for trade ${trade.id}`,
        },
      });

      return trade;
    });
  }

  async findAll(query: TradeQueryDto) {
    const skip = query.skip || 0;
    const take = Math.min(query.take || 50, 100); // Max 100 records per request

    return this.prisma.trade.findMany({
      where: {
        userId: query.userId,
        assetId: query.assetId,
        direction: query.direction,
        status: query.status,
      },
      include: this.includeRelationsMinimal(), // Use minimal includes for list queries
      orderBy: {
        openedAt: 'desc',
      },
      skip,
      take,
    });
  }

  async findOne(id: string) {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
      include: this.includeRelationsMinimal(),
    });

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    return trade;
  }

  async findByUser(userId: string, skip?: number, take?: number) {
    const offset = skip || 0;
    const limit = Math.min(take || 50, 100); // Max 100 records per request

    return this.prisma.trade.findMany({
      where: { userId },
      include: this.includeRelationsMinimal(), // Use minimal includes for list queries
      orderBy: {
        openedAt: 'desc',
      },
      skip: offset,
      take: limit,
    });
  }

  async settle(id: string, dto: SettleTradeDto) {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            wallets: true,
          },
        },
        asset: true,
      },
    });

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    if (trade.status !== TradeStatus.OPEN) {
      throw new BadRequestException('Trade is already settled');
    }

    const wallet = trade.user.wallets.find((item) => item.currency === 'KES');

    if (!wallet) {
      throw new NotFoundException('KES wallet not found');
    }

    const exitPrice = new Prisma.Decimal(dto.exitPrice);
    const resultStatus = this.calculateResult(
      trade.direction,
      trade.entryPrice,
      exitPrice,
    );

    const profitAmount = this.calculateProfit(
      resultStatus,
      trade.stakeAmount,
      trade.payoutRate,
    );

    return this.prisma.$transaction(async (tx) => {
      const updatedTrade = await tx.trade.update({
        where: { id },
        data: {
          status: resultStatus,
          exitPrice,
          profitAmount,
          closedAt: new Date(),
        },
        include: this.includeRelationsMinimal(),
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          locked: {
            decrement: trade.stakeAmount,
          },
        },
      });

      if (resultStatus === TradeStatus.WON) {
        const totalPayout = trade.stakeAmount.plus(profitAmount);

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              increment: totalPayout,
            },
          },
        });

        const transaction = await tx.transaction.create({
          data: {
            userId: trade.userId,
            walletId: wallet.id,
            type: TransactionType.TRADE_PROFIT,
            status: TransactionStatus.COMPLETED,
            amount: totalPayout,
            reference: `TRADE_PROFIT_${trade.id}`,
            description: `Trade won. Payout for trade ${trade.id}`,
          },
        });

        await tx.payout.create({
          data: {
            userId: trade.userId,
            walletId: wallet.id,
            transactionId: transaction.id,
            tradeId: trade.id,
            amount: totalPayout,
            currency: wallet.currency,
            status: TransactionStatus.COMPLETED,
          },
        });
      }

      if (resultStatus === TradeStatus.DRAW) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              increment: trade.stakeAmount,
            },
          },
        });

        await tx.transaction.create({
          data: {
            userId: trade.userId,
            walletId: wallet.id,
            type: TransactionType.REFUND,
            status: TransactionStatus.COMPLETED,
            amount: trade.stakeAmount,
            reference: `TRADE_REFUND_${trade.id}`,
            description: `Trade draw. Stake refunded for trade ${trade.id}`,
          },
        });
      }

      return updatedTrade;
    });
  }

  async cancel(id: string, reason?: string) {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            wallets: true,
          },
        },
      },
    });

    if (!trade) {
      throw new NotFoundException('Trade not found');
    }

    if (trade.status !== TradeStatus.OPEN) {
      throw new BadRequestException('Only open trades can be cancelled');
    }

    const wallet = trade.user.wallets.find((item) => item.currency === 'KES');

    if (!wallet) {
      throw new NotFoundException('KES wallet not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedTrade = await tx.trade.update({
        where: { id },
        data: {
          status: TradeStatus.CANCELLED,
          closedAt: new Date(),
        },
        include: this.includeRelationsMinimal(),
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          locked: {
            decrement: trade.stakeAmount,
          },
          balance: {
            increment: trade.stakeAmount,
          },
        },
      });

      await tx.transaction.create({
        data: {
          userId: trade.userId,
          walletId: wallet.id,
          type: TransactionType.REFUND,
          status: TransactionStatus.COMPLETED,
          amount: trade.stakeAmount,
          reference: `TRADE_CANCELLED_${trade.id}`,
          description: reason ?? `Trade cancelled and stake refunded`,
        },
      });

      return updatedTrade;
    });
  }

  private calculateResult(
    direction: TradeDirection,
    entryPrice: Prisma.Decimal,
    exitPrice: Prisma.Decimal,
  ) {
    if (exitPrice.equals(entryPrice)) {
      return TradeStatus.DRAW;
    }

    if (
      direction === TradeDirection.BUY &&
      exitPrice.greaterThan(entryPrice)
    ) {
      return TradeStatus.WON;
    }

    if (
      direction === TradeDirection.SELL &&
      exitPrice.lessThan(entryPrice)
    ) {
      return TradeStatus.WON;
    }

    return TradeStatus.LOST;
  }

  private calculateProfit(
    status: TradeStatus,
    stakeAmount: Prisma.Decimal,
    payoutRate: Prisma.Decimal,
  ) {
    if (status !== TradeStatus.WON) {
      return new Prisma.Decimal(0);
    }

    return stakeAmount.mul(payoutRate);
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
      asset: true,
      expiry: true,
      payouts: true, // Only for operations that need payouts
    };
  }

  // Minimal includes for list/read operations - avoids N+1 payouts query
  private includeRelationsMinimal() {
    return {
      user: {
        select: {
          id: true,
          fullname: true,
          email: true,
          phone: true,
        },
      },
      asset: {
        select: {
          id: true,
          pair: true,
          payoutRate: true,
          isActive: true,
        },
      },
      expiry: {
        select: {
          id: true,
          duration: true,
          isActive: true,
        },
      },
      // Intentionally exclude payouts to avoid N+1 query
    };
  }
}