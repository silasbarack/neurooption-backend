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
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: dto.walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.userId !== dto.userId) {
      throw new BadRequestException('Wallet does not belong to this user');
    }

    return this.prisma.transaction.create({
      data: {
        userId: dto.userId,
        walletId: dto.walletId,
        type: dto.type,
        status: dto.status ?? TransactionStatus.PENDING,
        amount: new Prisma.Decimal(dto.amount),
        reference: dto.reference,
        description: dto.description,
      },
      include: this.includeRelations(),
    });
  }

  async findAll(query: TransactionQueryDto) {
    return this.prisma.transaction.findMany({
      where: {
        userId: query.userId,
        walletId: query.walletId,
        type: query.type,
        status: query.status,
      },
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: this.includeRelations(),
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async findByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: this.includeRelations(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateTransactionStatusDto,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        wallet: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException(
        'Completed transaction cannot be changed',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          status: dto.status,
          description: dto.description ?? transaction.description,
        },
        include: this.includeRelations(),
      });

      if (dto.status === TransactionStatus.COMPLETED) {
        await this.applyWalletEffect(tx, {
          walletId: transaction.walletId,
          type: transaction.type,
          amount: transaction.amount,
        });
      }

      return updated;
    });
  }

  async markProcessing(id: string) {
    return this.updateStatus(id, {
      status: TransactionStatus.PENDING,
    });
  }

  async markCompleted(id: string) {
    return this.updateStatus(id, {
      status: TransactionStatus.COMPLETED,
    });
  }

  async markFailed(id: string, reason?: string) {
    return this.updateStatus(id, {
      status: TransactionStatus.FAILED,
      description: reason,
    });
  }

  async markRejected(id: string, reason?: string) {
    return this.updateStatus(id, {
      status: TransactionStatus.REJECTED,
      description: reason,
    });
  }

  async markCancelled(id: string, reason?: string) {
    return this.updateStatus(id, {
      status: TransactionStatus.CANCELLED,
      description: reason,
    });
  }

  private async applyWalletEffect(
    tx: Prisma.TransactionClient,
    params: {
      walletId: string;
      type: TransactionType;
      amount: Prisma.Decimal;
    },
  ) {
    const wallet = await tx.wallet.findUnique({
      where: { id: params.walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (this.isCredit(params.type)) {
      return tx.wallet.update({
        where: { id: params.walletId },
        data: {
          balance: {
            increment: params.amount,
          },
        },
      });
    }

    if (this.isDebit(params.type)) {
      if (wallet.balance.lessThan(params.amount)) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      return tx.wallet.update({
        where: { id: params.walletId },
        data: {
          balance: {
            decrement: params.amount,
          },
        },
      });
    }

    throw new BadRequestException('Unsupported transaction type');
  }

  private isCredit(type: TransactionType) {
    const creditTypes: TransactionType[] = [
      TransactionType.DEPOSIT,
      TransactionType.TRADE_PROFIT,
      TransactionType.BONUS,
      TransactionType.REFUND,
      TransactionType.ADMIN_ADJUSTMENT,
    ];

    return creditTypes.includes(type);
  }

  private isDebit(type: TransactionType) {
    const debitTypes: TransactionType[] = [
      TransactionType.WITHDRAWAL,
      TransactionType.TRADE_STAKE,
    ];

    return debitTypes.includes(type);
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
      deposit: true,
      withdrawal: true,
      payout: true,
      notifications: true,
    };
  }
}