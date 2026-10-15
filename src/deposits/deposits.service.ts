import {
  BadRequestException,
  Optional,
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
import { EmailsService } from '../emails/emails.service';
import { LedgerService } from '../ledger/ledger.service';
import { paymentGatewayTypeToClearingAccountCode } from '../ledger/ledger.types';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositStatusDto } from './dto/update-deposit-status.dto';

const LEDGER_CURRENCIES = new Set(Object.values(AccountCurrency));

@Injectable()
export class DepositsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
    @Optional() private readonly emails?: EmailsService,
  ) {}

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
        gateway: true,
      },
    });

    if (!deposit) throw new NotFoundException('Deposit not found');

    if (deposit.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('Deposit already completed');
    }

    // The ledger only models currencies in the AccountCurrency enum.
    // Deposit.currency is a free-form legacy string column, so guard it
    // before posting rather than letting Prisma reject an invalid enum
    // value deep inside the ledger call.
    if (
      dto.status === TransactionStatus.COMPLETED &&
      !LEDGER_CURRENCIES.has(deposit.currency as AccountCurrency)
    ) {
      throw new BadRequestException(
        `Currency ${deposit.currency} is not supported by the real-money ledger yet`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
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

        // Ledger is the real source of truth for real-money balances; the
        // Wallet.balance increment above is kept so existing reads (e.g.
        // withdrawals.service.ts's own balance check) keep working.
        await this.ledgerService.confirmDeposit(
          {
            userId: deposit.userId,
            amount: deposit.amount,
            currency: deposit.currency as AccountCurrency,
            clearingAccountCode: paymentGatewayTypeToClearingAccountCode(deposit.gateway.type),
            idempotencyKey: deposit.id,
            depositId: deposit.id,
            externalReference: dto.externalRef ?? deposit.externalRef ?? undefined,
            description: `Deposit confirmed via ${deposit.gateway.type}`,
          },
          tx,
        );
      }

      return updated;
    });

    // Email only after the status change has committed: a completed deposit
    // has been credited, a failed one has not. Never blocks the change.
    await this.notifyClient(result, dto.status, dto.externalRef);
    return result;
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

  private async notifyClient(
    deposit: { id: string; amount: unknown; currency: string; externalRef: string | null; updatedAt: Date; user: { id: string; email: string; fullName: string } | null; gateway: { name: string } | null },
    status: TransactionStatus,
    detail?: string,
  ) {
    if (!this.emails || !deposit.user) return;
    const finalFailure = status === TransactionStatus.FAILED || status === TransactionStatus.REJECTED || status === TransactionStatus.CANCELLED;
    if (status !== TransactionStatus.COMPLETED && !finalFailure) return;
    const owner = await this.prisma.user.findUnique({ where: { id: deposit.user.id }, select: { status: true } });
    if (!owner || owner.status === 'DELETED') return;
    const data = {
      amount: Number(deposit.amount),
      currency: deposit.currency,
      method: deposit.gateway?.name || 'M-Pesa',
      transactionId: status === TransactionStatus.COMPLETED ? deposit.externalRef || deposit.id : deposit.id,
      dateTime: `${new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Nairobi' }).format(deposit.updatedAt)} EAT`,
    };
    try {
      if (status === TransactionStatus.COMPLETED) {
        await this.emails.sendDepositSuccessfulEmail(deposit.user.email, data, { userId: deposit.user.id, dedupeKey: `deposit-completed:${deposit.id}` });
      } else {
        await this.emails.sendDepositFailedEmail(
          deposit.user.email,
          { ...data, reason: (detail || 'The payment was not completed').slice(0, 180) },
          { userId: deposit.user.id, dedupeKey: `deposit-failed:${deposit.id}` },
        );
      }
    } catch {
      // Recorded by EmailsService; the deposit status stands.
    }
  }
}
