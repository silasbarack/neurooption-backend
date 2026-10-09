import { randomUUID } from 'crypto';
import {
  BadRequestException, ConflictException, HttpException, HttpStatus,
  Injectable, NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { EmailOutboxService } from '../emails/email-outbox.service';
import { lockActiveUser } from '../common/lock-active-user';
import { serializableTransaction } from '../common/serializable-transaction';
import { DELETION_CONFIRMATION_WORD, DELETION_REASONS } from './account-deletion.constants';
import { DeleteAccountDto } from './dto/delete-account.dto';

type Db = PrismaClient | Prisma.TransactionClient;
export type DeletionBlocker = {
  code: 'STAFF_ACCOUNT' | 'FUNDS' | 'LOCKED_FUNDS' | 'OPEN_TRADES' | 'PENDING_WITHDRAWAL' |
    'PENDING_DEPOSIT' | 'PENDING_PAYOUT' | 'UNPAID_COMMISSION' | 'PENDING_ACTIVITY';
  message: string;
  action?: { label: string; path: string };
};

const MAX_PASSWORD_FAILURES = 5;
const PASSWORD_WINDOW_MS = 15 * 60_000;

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return domain ? local.slice(0, 1) + '***@' + domain : '***';
}

@Injectable()
export class AccountDeletionService {
  private readonly passwordFailures = new Map<string, { count: number; since: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly emails: EmailsService,
    private readonly outbox: EmailOutboxService,
  ) {}

  async check(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt || user.status === 'DELETED') throw new NotFoundException('Account not found.');
    const blockers = await this.findBlockers(this.prisma, user);
    return {
      canDelete: blockers.length === 0, blockers, reasons: DELETION_REASONS,
      confirmationWord: DELETION_CONFIRMATION_WORD, emailHint: maskEmail(user.email),
    };
  }

  async deleteAccount(userId: string, dto: DeleteAccountDto, meta: { ipAddress?: string; userAgent?: string } = {}) {
    if (dto?.confirmation !== DELETION_CONFIRMATION_WORD) {
      throw new BadRequestException('Type ' + DELETION_CONFIRMATION_WORD + ' exactly to confirm.');
    }
    const reason = DELETION_REASONS.find((item) => item.code === dto.reason);
    if ((dto.reason && !reason) || (dto.comment && (typeof dto.comment !== 'string' || dto.comment.length > 500))) {
      throw new BadRequestException('Choose a valid deletion reason and keep optional feedback within 500 characters.');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt || user.status === 'DELETED') throw new NotFoundException('Account not found.');
    await this.verifyPassword(user.id, dto.password, user.passwordHash);
    const reference = 'DEL-' + randomUUID().toUpperCase();
    const deletedAt = new Date();
    const passwordHash = await bcrypt.hash(randomUUID(), 12);
    const comment = dto.comment?.trim() || undefined;
    const reasonLabel = reason?.label || 'Prefer not to say';

    const notificationEmail = await serializableTransaction(this.prisma, async (tx) => {
      await lockActiveUser(tx, userId);
      const current = await tx.user.findUnique({ where: { id: userId } });
      if (!current || current.deletedAt || current.status === 'DELETED') throw new NotFoundException('Account not found.');
      if (current.passwordHash !== user.passwordHash) {
        throw new UnauthorizedException('Account credentials changed. Sign in again before deleting the account.');
      }
      const blockers = await this.findBlockers(tx, current);
      if (blockers.length) {
        throw new ConflictException({
          statusCode: 409, code: 'ACCOUNT_DELETION_BLOCKED',
          message: 'This account cannot be deleted yet.', blockers,
        });
      }

      await tx.passwordResetToken.deleteMany({ where: { userId } });
      await this.outbox.cancel(tx, userId);
      await tx.socialFollow.updateMany({
        where: { OR: [{ followerUserId: userId }, { traderUserId: userId }] }, data: { status: 'STOPPED' },
      });
      await tx.affiliate.updateMany({ where: { userId }, data: { status: 'DISABLED' } });
      await tx.notification.updateMany({ where: { userId }, data: { recipientEmail: '', body: '' } });
      await tx.tradingAccount.updateMany({ where: { userId }, data: { isActive: false } });
      await tx.ledgerAccount.updateMany({ where: { userId }, data: { isActive: false } });
      await tx.user.update({
        where: { id: userId },
        data: {
          status: 'DELETED', fullName: 'Deleted user',
          email: 'deleted-' + reference.slice(4).toLowerCase() + '@deleted.neurooption.invalid',
          phone: null, passwordHash, referralCode: null, referredById: null,
          deletedAt, deletionReference: reference, authTokenVersion: { increment: 1 },
        },
      });
      await tx.auditLog.create({
        data: {
          userId, action: 'ACCOUNT_DELETED', targetType: 'User', targetId: userId,
          description: 'Account deleted by its owner.',
          ipAddress: meta.ipAddress, userAgent: meta.userAgent?.slice(0, 300),
          metadata: { reference, deletedAt: deletedAt.toISOString(), reason: reason?.code ?? null,
            comment: comment ?? null, emailDelivery: 'queued' },
        },
      });
      await this.outbox.enqueue(tx, {
        userId, kind: 'ACCOUNT_DELETED', deduplicationKey: 'account-deleted:' + userId,
        recipient: current.email,
        template: this.emails.accountDeletionConfirmed({
          email: current.email, fullName: current.fullName || current.email.split('@')[0] || 'Trader',
          reference, deletedAt, reasonLabel: reasonLabel + (dto.reason === 'OTHER' && comment ? ': ' + comment : ''),
        }),
      });
      return current.email;
    });
    this.passwordFailures.delete(userId);
    this.outbox.kick();
    return {
      success: true, message: 'Your account has been deleted.', deleted: true, reference,
      deletionReference: reference, deletedAt: deletedAt.toISOString(), notificationEmail,
      emailHint: maskEmail(notificationEmail), emailSent: false, emailDelivery: 'queued' as const,
    };
  }

  private async verifyPassword(userId: string, password: string, hash: string) {
    const now = Date.now();
    const entry = this.passwordFailures.get(userId);
    if (entry && now - entry.since <= PASSWORD_WINDOW_MS && entry.count >= MAX_PASSWORD_FAILURES) {
      throw new HttpException('Too many incorrect passwords. Try again in a few minutes.', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (typeof password === 'string' && await bcrypt.compare(password, hash).catch(() => false)) return;
    const fresh = entry && now - entry.since <= PASSWORD_WINDOW_MS ? entry : { count: 0, since: now };
    fresh.count++;
    this.passwordFailures.set(userId, fresh);
    throw new UnauthorizedException('That password is not correct.');
  }

  private async findBlockers(db: Db, user: { id: string; role: string }): Promise<DeletionBlocker[]> {
    const userId = user.id;
    const blockers: DeletionBlocker[] = [];
    const finance = { label: 'View transactions', path: '/finance?tab=history' };
    if (user.role !== 'USER') {
      blockers.push({ code: 'STAFF_ACCOUNT', message: 'Staff accounts cannot be deleted here. Ask another administrator.' });
    }
    const [wallets, realAccounts, engineWallets, openTrades, engineTrades, copies,
      withdrawals, deposits, payouts, commissions, transactions, engineTransactions, ledger] = await Promise.all([
      db.wallet.findMany({ where: { userId } }),
      db.tradingAccount.findMany({ where: { userId, type: 'REAL' } }),
      db.engineWallet.findMany({ where: { userId, accountType: 'QT Real' } }),
      db.trade.count({ where: { userId, status: 'OPEN' } }),
      db.engineTrade.count({ where: { userId, status: 'PENDING' } }),
      Promise.resolve(0),
      db.withdrawal.count({ where: { userId, status: { in: ['PENDING', 'PROCESSING'] } } }),
      db.deposit.count({ where: { userId, status: { in: ['PENDING', 'PROCESSING'] } } }),
      Promise.resolve(0),
      Promise.resolve(0),
      db.transaction.count({ where: { userId, status: { in: ['PENDING', 'PROCESSING'] } } }),
      db.engineTransaction.count({ where: { userId, accountType: 'QT Real', status: { in: ['PENDING', 'PROCESSING'] } } }),
      db.ledgerEntry.groupBy({ by: ['accountId', 'side'], where: { account: { userId } }, _sum: { amount: true } }),
    ]);
    const balances = new Map<string, Prisma.Decimal>();
    for (const entry of ledger) {
      const balance = balances.get(entry.accountId) || new Prisma.Decimal(0);
      const amount = entry._sum.amount || new Prisma.Decimal(0);
      balances.set(entry.accountId, entry.side === 'CREDIT' ? balance.plus(amount) : balance.minus(amount));
    }
    if (wallets.some((wallet) => !wallet.balance.isZero()) ||
      realAccounts.some((account) => !account.balance.isZero()) ||
      engineWallets.some((wallet) => !wallet.balance.isZero() || !wallet.balanceUsd.isZero()) ||
      [...balances.values()].some((balance) => !balance.isZero())) {
      blockers.push({
        code: 'FUNDS', message: 'Your real account still holds funds or an unsettled ledger balance. Withdraw available funds first, or contact Support for help settling the balance.',
        action: { label: 'Withdraw funds', path: '/finance?tab=withdraw' },
      });
    }
    if (wallets.some((wallet) => !wallet.locked.isZero()) ||
      realAccounts.some((account) => !account.locked.isZero()) ||
      engineWallets.some((wallet) => !wallet.locked.isZero() || !wallet.lockedUsd.isZero())) {
      blockers.push({ code: 'LOCKED_FUNDS', message: 'Some funds are reserved. Wait until withdrawals and open positions settle.', action: finance });
    }
    if (openTrades || engineTrades || copies) {
      blockers.push({ code: 'OPEN_TRADES', message: 'You have open trades or copy trades. Wait until they settle.', action: { label: 'View open trades', path: '/open-trades' } });
    }
    if (withdrawals) blockers.push({ code: 'PENDING_WITHDRAWAL', message: 'A withdrawal is still being processed. Wait until it is paid or declined.', action: finance });
    if (deposits) blockers.push({ code: 'PENDING_DEPOSIT', message: 'A deposit is still being confirmed. Wait until it completes or fails.', action: finance });
    if (payouts) blockers.push({ code: 'PENDING_PAYOUT', message: 'A payout is still being processed. Wait until it settles.', action: finance });
    if (commissions) blockers.push({ code: 'UNPAID_COMMISSION', message: 'Affiliate commissions are unpaid. Contact Support to settle them before deleting the account.', action: { label: 'Contact Support', path: '/help' } });
    if (transactions || engineTransactions) blockers.push({ code: 'PENDING_ACTIVITY', message: 'A payment transaction is still processing. Wait until it settles.', action: finance });
    return blockers;
  }
}
