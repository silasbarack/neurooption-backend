import {
  BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { EmailOutboxService } from '../emails/email-outbox.service';
import { serializableTransaction } from '../common/serializable-transaction';
import { lockActiveUser } from '../common/lock-active-user';
import { DeleteAccountDto, DELETE_ACCOUNT_CONFIRMATION, DELETION_REASONS } from './dto/delete-account.dto';
import { publicUser } from './public-user';

export type UpdateUserPayload = {
  fullName?: string; name?: string; phone?: string; country?: string; currency?: string;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailsService: EmailsService,
    private readonly outbox: EmailOutboxService,
  ) {}

  private getUserDisplayName(user: User): string {
    return user.fullName || user.email.split('@')[0] || 'Trader';
  }

  async findAll() {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map((user) => publicUser(user));
  }

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new NotFoundException('User account not found.');
    return publicUser(user);
  }

  async getMe(userId: string) { return this.findById(userId); }

  async updateMe(userId: string, payload: UpdateUserPayload) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing || existing.deletedAt) throw new NotFoundException('User account not found.');
    const updated = await this.prisma.user.update({
      where: { id: userId, deletedAt: null },
      data: { fullName: payload.fullName ?? payload.name, phone: payload.phone },
    });
    return publicUser(updated);
  }

  async deleteMe(userId: string, payload: DeleteAccountDto) {
    if (payload?.confirmation !== DELETE_ACCOUNT_CONFIRMATION) {
      throw new BadRequestException('Type ' + DELETE_ACCOUNT_CONFIRMATION + ' exactly to confirm deletion.');
    }
    const reason = payload.reason || 'PREFER_NOT_TO_SAY';
    if (!Object.prototype.hasOwnProperty.call(DELETION_REASONS, reason) ||
      (payload.otherReason && (typeof payload.otherReason !== 'string' || payload.otherReason.length > 500))) {
      throw new BadRequestException('Choose a valid deletion reason and keep optional feedback within 500 characters.');
    }
    if (typeof payload.currentPassword !== 'string' || !payload.currentPassword) {
      throw new UnauthorizedException('Enter your current password to delete your account.');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new NotFoundException('User account not found.');
    if (!(await bcrypt.compare(payload.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Your current password is incorrect.');
    }
    const reference = 'NO-' + randomUUID().toUpperCase();
    const deletedAt = new Date();
    const replacementHash = await bcrypt.hash(randomUUID(), 12);
    const feedback = reason === 'OTHER' ? payload.otherReason?.trim() : '';
    const reasonLabel = DELETION_REASONS[reason] + (feedback ? ': ' + feedback : '');
    const notificationEmail = await serializableTransaction(this.prisma, async (tx) => {
      await lockActiveUser(tx, userId);
      const current = await tx.user.findUnique({ where: { id: userId } });
      if (!current || current.deletedAt) throw new NotFoundException('User account not found.');
      if (current.passwordHash !== user.passwordHash) {
        throw new UnauthorizedException('Account credentials changed. Sign in again before deleting the account.');
      }
      const blockers = await Promise.all([
        tx.wallet.count({ where: { userId, OR: [{ balance: { not: 0 } }, { locked: { not: 0 } }] } }),
        tx.tradingAccount.count({ where: { userId, type: 'REAL', OR: [{ balance: { not: 0 } }, { locked: { not: 0 } }] } }),
        tx.engineWallet.count({ where: { userId, accountType: 'QT Real', OR: [{ balance: { not: 0 } }, { balanceUsd: { not: 0 } }, { locked: { not: 0 } }, { lockedUsd: { not: 0 } }] } }),
        tx.trade.count({ where: { userId, status: 'OPEN' } }),
        tx.engineTrade.count({ where: { userId, status: 'PENDING' } }),
        tx.deposit.count({ where: { userId, status: { in: ['PENDING', 'PROCESSING'] } } }),
        tx.withdrawal.count({ where: { userId, status: { in: ['PENDING', 'PROCESSING'] } } }),
        tx.transaction.count({ where: { userId, status: { in: ['PENDING', 'PROCESSING'] } } }),
        tx.engineTransaction.count({ where: { userId, accountType: 'QT Real', status: { in: ['PENDING', 'PROCESSING'] } } }),
      ]);
      const ledger = await tx.ledgerEntry.groupBy({
        by: ['accountId', 'side'], where: { account: { userId } }, _sum: { amount: true },
      });
      const balances = new Map<string, Prisma.Decimal>();
      for (const entry of ledger) {
        const balance = balances.get(entry.accountId) || new Prisma.Decimal(0);
        const amount = entry._sum.amount || new Prisma.Decimal(0);
        balances.set(entry.accountId, entry.side === 'CREDIT' ? balance.plus(amount) : balance.minus(amount));
      }
      if (blockers.some(Boolean) || [...balances.values()].some((balance) => !balance.isZero())) {
        throw new ConflictException({
          code: 'ACCOUNT_NOT_SETTLED',
          message: 'Withdraw any remaining real funds and wait for open trades, deposits, withdrawals, payouts and affiliate commissions to settle before deleting your account. Contact Support if you need help.',
        });
      }

      await tx.passwordResetToken.deleteMany({ where: { userId } });
      await this.outbox.cancel(tx, userId);
      // Retain referenced follows so settled copy-trading history remains valid.
      await tx.socialFollow.deleteMany({ where: { OR: [{ followerUserId: userId }, { traderUserId: userId }] } });
      await tx.notification.updateMany({ where: { userId }, data: { recipientEmail: '', body: '' } });
      await tx.tradingAccount.updateMany({ where: { userId }, data: { isActive: false } });
      await tx.ledgerAccount.updateMany({ where: { userId }, data: { isActive: false } });
      await tx.user.update({
        where: { id: userId },
        data: {
          fullName: 'Deleted account',
          email: 'deleted-' + reference.slice(3).toLowerCase() + '@deleted.neurooption.invalid',
          phone: null, passwordHash: replacementHash, status: 'LOCKED',
          referralCode: null, referredById: null, deletedAt, deletionReference: reference,
          authTokenVersion: { increment: 1 },
        },
      });
      await tx.auditLog.create({
        data: { userId, action: 'ACCOUNT_DELETED', targetType: 'User', targetId: userId,
          metadata: { reference, reason, ...(feedback ? { feedback } : {}) } },
      });
      await this.outbox.enqueue(tx, {
        userId, kind: 'ACCOUNT_DELETED', deduplicationKey: 'account-deleted:' + userId,
        recipient: current.email,
        template: this.emailsService.accountDeleted(this.getUserDisplayName(current), {
          email: current.email, reference, deletedAt, reason: reasonLabel,
        }),
      });
      return current.email;
    });
    this.outbox.kick();
    return {
      success: true, message: 'Account deleted successfully.', deleted: true,
      deletionReference: reference, deletedAt: deletedAt.toISOString(), notificationEmail, emailDelivery: 'queued',
    };
  }
}
