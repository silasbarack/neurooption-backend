import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PaymentDirection,
  Prisma,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

import { PrismaService } from '../config/prisma.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';

@Injectable()
export class WithdrawalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWithdrawalDto) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: dto.walletId },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    if (wallet.userId !== dto.userId) {
      throw new BadRequestException('Wallet does not belong to user');
    }

    const amount = new Prisma.Decimal(dto.amount);

    if (wallet.balance.lessThan(amount)) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const gateway = await this.prisma.paymentGateway.findUnique({
      where: {
        type_direction: {
          type: dto.gatewayType,
          direction: PaymentDirection.OUT,
        },
      },
    });

    if (!gateway) throw new NotFoundException('Withdrawal gateway not found');

    if (!gateway.isActive) {
      throw new BadRequestException('Payment gateway is inactive');
    }

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: dto.userId,
          walletId: dto.walletId,
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.PENDING,
          amount,
          reference: `WDR_${Date.now()}`,
          description: `Withdrawal via ${gateway.type}`,
        },
      });

      await tx.wallet.update({
        where: { id: dto.walletId },
        data: {
          balance: {
            decrement: amount,
          },
          locked: {
            increment: amount,
          },
        },
      });

      return tx.withdrawal.create({
        data: {
          userId: dto.userId,
          walletId: dto.walletId,
          gatewayId: gateway.id,
          transactionId: transaction.id,
          amount,
          currency: dto.currency ?? wallet.currency,
          phone: dto.phone,
          status: TransactionStatus.PENDING,
        },
        include: this.includeRelations(),
      });
    });
  }

  async findAll() {
    return this.prisma.withdrawal.findMany({
      include: this.includeRelations(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.withdrawal.findMany({
      where: { userId },
      include: this.includeRelations(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
      include: this.includeRelations(),
    });

    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    return withdrawal;
  }

  async updateStatus(id: string, dto: UpdateWithdrawalStatusDto) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
      include: {
        transaction: true,
        wallet: true,
      },
    });

    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    if (withdrawal.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('Withdrawal already completed');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.withdrawal.update({
        where: { id },
        data: {
          status: dto.status,
          externalRef: dto.externalRef,
          rejectionReason: dto.rejectionReason,
        },
        include: this.includeRelations(),
      });

      await tx.transaction.update({
        where: { id: withdrawal.transactionId },
        data: {
          status: dto.status,
          reference: dto.externalRef ?? withdrawal.transaction.reference,
          description:
            dto.rejectionReason ?? withdrawal.transaction.description,
        },
      });

      if (dto.status === TransactionStatus.COMPLETED) {
        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: {
            locked: {
              decrement: withdrawal.amount,
            },
          },
        });
      }

      if (
        dto.status === TransactionStatus.REJECTED ||
        dto.status === TransactionStatus.FAILED ||
        dto.status === TransactionStatus.CANCELLED
      ) {
        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: {
            locked: {
              decrement: withdrawal.amount,
            },
            balance: {
              increment: withdrawal.amount,
            },
          },
        });
      }

      return updated;
    });
  }

  async approve(id: string, externalRef?: string) {
    return this.updateStatus(id, {
      status: TransactionStatus.COMPLETED,
      externalRef,
    });
  }

  async reject(id: string, rejectionReason: string) {
    return this.updateStatus(id, {
      status: TransactionStatus.REJECTED,
      rejectionReason,
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
      wallet: true,
      gateway: true,
      transaction: true,
    };
  }
}