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
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositStatusDto } from './dto/update-deposit-status.dto';

@Injectable()
export class DepositsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDepositDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: dto.walletId },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');

    if (wallet.userId !== dto.userId) {
      throw new BadRequestException('Wallet does not belong to user');
    }

    const gateway = await this.prisma.paymentGateway.findUnique({
      where: {
        type_direction: {
          type: dto.gatewayType,
          direction: PaymentDirection.IN,
        },
      },
    });

    if (!gateway) throw new NotFoundException('Deposit gateway not found');

    if (!gateway.isActive) {
      throw new BadRequestException('Payment gateway is inactive');
    }

    const amount = new Prisma.Decimal(dto.amount);

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: dto.userId,
          walletId: dto.walletId,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.PENDING,
          amount,
          reference: `DEP_${Date.now()}`,
          description: `Deposit via ${gateway.type}`,
        },
      });

      return tx.deposit.create({
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
    return this.prisma.deposit.findMany({
      include: this.includeRelations(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.deposit.findMany({
      where: { userId },
      include: this.includeRelations(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id },
      include: this.includeRelations(),
    });

    if (!deposit) throw new NotFoundException('Deposit not found');

    return deposit;
  }

  async updateStatus(id: string, dto: UpdateDepositStatusDto) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id },
      include: {
        transaction: true,
        wallet: true,
      },
    });

    if (!deposit) throw new NotFoundException('Deposit not found');

    if (deposit.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('Deposit already completed');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.deposit.update({
        where: { id },
        data: {
          status: dto.status,
          externalRef: dto.externalRef,
        },
        include: this.includeRelations(),
      });

      await tx.transaction.update({
        where: { id: deposit.transactionId },
        data: {
          status: dto.status,
          reference: dto.externalRef ?? deposit.transaction.reference,
        },
      });

      if (dto.status === TransactionStatus.COMPLETED) {
        await tx.wallet.update({
          where: { id: deposit.walletId },
          data: {
            balance: {
              increment: deposit.amount,
            },
          },
        });
      }

      return updated;
    });
  }

  async markCompleted(id: string, externalRef?: string) {
    return this.updateStatus(id, {
      status: TransactionStatus.COMPLETED,
      externalRef,
    });
  }

  async markFailed(id: string, externalRef?: string) {
    return this.updateStatus(id, {
      status: TransactionStatus.FAILED,
      externalRef,
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