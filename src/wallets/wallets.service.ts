import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  NotificationType,
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';

import { PrismaService } from '../common/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DepositDto } from './dto/deposit.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class WalletsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailsService: EmailsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private now(): string {
    return new Date().toISOString().replace('T', ' ').slice(0, 16);
  }

  private generateReference(prefix: 'DEP' | 'WDR', userId: string): string {
    return `NO-${prefix}-${userId.slice(0, 8).toUpperCase()}-${Date.now()}`;
  }

  private extractMethod(description: string | null): string {
    if (!description) {
      return 'Selected payment method';
    }

    if (description.includes(' withdrawal request')) {
      return description.replace(' withdrawal request', '').trim();
    }

    if (description.includes(' deposit')) {
      return description.replace(' deposit', '').trim();
    }

    return description.trim();
  }

  private async findWithdrawalTransaction(
    transactionId: string,
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        OR: [{ id: transactionId }, { reference: transactionId }],
        type: TransactionType.WITHDRAWAL,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Withdrawal transaction not found');
    }

    return transaction;
  }

  private async getUserEmail(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.email;
  }

  async getUserWallets(userId: string) {
    return this.prisma.wallet.findMany({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async deposit(dto: DepositDto) {
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        userId: dto.userId,
        currency: dto.currency,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const recipientEmail = await this.getUserEmail(dto.userId);
    const reference = this.generateReference('DEP', dto.userId);

    const updatedWallet = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: dto.amount,
        },
      },
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        userId: dto.userId,
        walletId: wallet.id,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        amount: dto.amount,
        reference,
        description: `${dto.method} deposit`,
      },
    });

    const email = this.emailsService.depositSuccessful({
      amount: dto.amount,
      currency: dto.currency,
      method: dto.method,
      transactionId: reference,
      dateTime: this.now(),
    });

    const notification = await this.notificationsService.create({
      userId: dto.userId,
      type: NotificationType.DEPOSIT_SUCCESSFUL,
      subject: email.subject,
      body: email.body,
      recipientEmail,
      transactionId: transaction.id,
    });

    return {
      message: 'Deposit successful',
      wallet: updatedWallet,
      transaction,
      email,
      notification,
    };
  }

  async withdraw(dto: WithdrawDto) {
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        userId: dto.userId,
        currency: dto.currency,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (Number(wallet.balance) < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const recipientEmail = await this.getUserEmail(dto.userId);
    const reference = this.generateReference('WDR', dto.userId);

    const updatedWallet = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: dto.amount,
        },
        locked: {
          increment: dto.amount,
        },
      },
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        userId: dto.userId,
        walletId: wallet.id,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        amount: dto.amount,
        reference,
        description: `${dto.method} withdrawal request`,
      },
    });

    const email = this.emailsService.withdrawalRequested({
      amount: dto.amount,
      currency: dto.currency,
      method: dto.method,
      transactionId: reference,
      dateTime: this.now(),
    });

    const notification = await this.notificationsService.create({
      userId: dto.userId,
      type: NotificationType.WITHDRAWAL_REQUESTED,
      subject: email.subject,
      body: email.body,
      recipientEmail,
      transactionId: transaction.id,
    });

    return {
      message: 'Withdrawal request placed',
      wallet: updatedWallet,
      transaction,
      email,
      notification,
    };
  }

  async markWithdrawalProcessing(transactionId: string) {
    const transaction = await this.findWithdrawalTransaction(transactionId);

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Only pending withdrawals can be marked as processing',
      );
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: transaction.walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const recipientEmail = await this.getUserEmail(transaction.userId);

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.PROCESSING,
        description: 'Withdrawal sent to external provider for processing',
      },
    });

    const email = this.emailsService.withdrawalProcessing({
      amount: Number(transaction.amount),
      currency: wallet.currency,
      method: this.extractMethod(transaction.description),
      transactionId: transaction.reference || transaction.id,
      dateTime: this.now(),
    });

    const notification = await this.notificationsService.create({
      userId: transaction.userId,
      type: NotificationType.WITHDRAWAL_PROCESSING,
      subject: email.subject,
      body: email.body,
      recipientEmail,
      transactionId: transaction.id,
    });

    return {
      message: 'Withdrawal marked as processing',
      transaction: updatedTransaction,
      email,
      notification,
    };
  }

  async completeWithdrawal(transactionId: string) {
    const transaction = await this.findWithdrawalTransaction(transactionId);

    if (
      transaction.status !== TransactionStatus.PENDING &&
      transaction.status !== TransactionStatus.PROCESSING
    ) {
      throw new BadRequestException(
        'Only pending or processing withdrawals can be completed',
      );
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: transaction.walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const recipientEmail = await this.getUserEmail(transaction.userId);

    const updatedWallet = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        locked: {
          decrement: transaction.amount,
        },
      },
    });

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.COMPLETED,
        description: 'Withdrawal completed successfully',
      },
    });

    const email = this.emailsService.withdrawalCompleted({
      amount: Number(transaction.amount),
      currency: wallet.currency,
      method: this.extractMethod(transaction.description),
      transactionId: transaction.reference || transaction.id,
      dateTime: this.now(),
    });

    const notification = await this.notificationsService.create({
      userId: transaction.userId,
      type: NotificationType.WITHDRAWAL_COMPLETED,
      subject: email.subject,
      body: email.body,
      recipientEmail,
      transactionId: transaction.id,
    });

    return {
      message: 'Withdrawal completed',
      wallet: updatedWallet,
      transaction: updatedTransaction,
      email,
      notification,
    };
  }

  async rejectWithdrawal(transactionId: string, dto: RejectWithdrawalDto) {
    const transaction = await this.findWithdrawalTransaction(transactionId);

    if (
      transaction.status !== TransactionStatus.PENDING &&
      transaction.status !== TransactionStatus.PROCESSING
    ) {
      throw new BadRequestException(
        'Only pending or processing withdrawals can be rejected',
      );
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: transaction.walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const recipientEmail = await this.getUserEmail(transaction.userId);

    const updatedWallet = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: transaction.amount,
        },
        locked: {
          decrement: transaction.amount,
        },
      },
    });

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.REJECTED,
        description: `Withdrawal rejected: ${dto.reason}`,
      },
    });

    const email = this.emailsService.withdrawalDeclined({
      amount: Number(transaction.amount),
      currency: wallet.currency,
      method: this.extractMethod(transaction.description),
      transactionId: transaction.reference || transaction.id,
      dateTime: this.now(),
      reason: dto.reason,
    });

    const notification = await this.notificationsService.create({
      userId: transaction.userId,
      type: NotificationType.WITHDRAWAL_REJECTED,
      subject: email.subject,
      body: email.body,
      recipientEmail,
      transactionId: transaction.id,
    });

    return {
      message: 'Withdrawal rejected',
      wallet: updatedWallet,
      transaction: updatedTransaction,
      email,
      notification,
    };
  }
}