import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountCurrency,
  PaymentDirection,
  Prisma,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

import { PrismaService } from '../config/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { paymentGatewayTypeToClearingAccountCode } from '../ledger/ledger.types';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';

const LEDGER_CURRENCIES = new Set(Object.values(AccountCurrency));

@Injectable()
export class WithdrawalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
  ) {}

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

    const currency = dto.currency ?? wallet.currency;
    if (!LEDGER_CURRENCIES.has(currency as AccountCurrency)) {
      throw new BadRequestException(
        `Currency ${currency} is not supported by the real-money ledger yet`,
      );
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

      // Created before the wallet/ledger updates below so we have a real
      // withdrawalId to pass into ledgerService.requestWithdrawal.
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: dto.userId,
          walletId: dto.walletId,
          gatewayId: gateway.id,
          transactionId: transaction.id,
          amount,
          currency,
          phone: dto.phone,
          status: TransactionStatus.PENDING,
        },
        include: this.includeRelations(),
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

      // Ledger is the real source of truth for real-money balances; the
      // Wallet balance/locked update above is kept so existing reads keep
      // working. This also re-validates available balance from ledger
      // entries and will throw (rolling back this whole transaction) if
      // it disagrees with the legacy Wallet-based check above.
      await this.ledgerService.requestWithdrawal(
        {
          userId: dto.userId,
          amount,
          currency: currency as AccountCurrency,
          withdrawalId: withdrawal.id,
          idempotencyKey: `withdrawal-requested-${withdrawal.id}`,
        },
        tx,
      );

      return withdrawal;
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
        gateway: true,
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

        await this.ledgerService.markWithdrawalPaid(
          {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            currency: withdrawal.currency as AccountCurrency,
            withdrawalId: withdrawal.id,
            clearingAccountCode: paymentGatewayTypeToClearingAccountCode(withdrawal.gateway.type),
            idempotencyKey: `withdrawal-paid-${withdrawal.id}`,
            description: `Withdrawal paid via ${withdrawal.gateway.type}`,
          },
          tx,
        );
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

        await this.ledgerService.rejectWithdrawal(
          {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            currency: withdrawal.currency as AccountCurrency,
            withdrawalId: withdrawal.id,
            reason: dto.rejectionReason ?? `Withdrawal ${dto.status.toLowerCase()}`,
            idempotencyKey: `withdrawal-rejected-${withdrawal.id}`,
          },
          tx,
        );
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
          fullName: true,
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