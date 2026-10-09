import { randomBytes } from 'node:crypto';
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
import {
  DELETION_CONFIRMATION_WORD,
  DELETION_REASONS,
  DUST,
} from './account-deletion.constants';
import { DeleteAccountDto } from './dto/delete-account.dto';

type Db = PrismaClient | Prisma.TransactionClient;

export type DeletionBlocker = {
  code:
    | 'STAFF_ACCOUNT'
    | 'FUNDS'
    | 'LOCKED_FUNDS'
    | 'OPEN_TRADES'
    | 'PENDING_WITHDRAWAL'
    | 'PENDING_DEPOSIT';
  message: string;
  /** Where the person can fix it, when there is somewhere to go. */
  action?: { label: string; path: string };
};

const MAX_PASSWORD_FAILURES = 5;
const PASSWORD_WINDOW_MS = 15 * 60_000;

const kes = (value: number) =>
  `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** "silas@gmail.com" -> "s***@gmail.com" */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 1)}***@${domain}`;
}

/**
 * Closing an account.
 *
 * The User row is kept (deposits, withdrawals, trades and ledger entries
 * point at it and must be retained), but it is switched to DELETED and all
 * personal details are removed, so the person is gone from the platform and
 * the email address can be registered again. It is refused while any money
 * or open position is still tied to the account, so nothing is ever stranded.
 */
@Injectable()
export class AccountDeletionService {
  private readonly logger = new Logger(AccountDeletionService.name);
  private readonly passwordFailures = new Map<string, { count: number; since: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly emails: EmailsService,
  ) {}

  /** What the deletion screen needs: suggested reasons and anything in the way. */
  async check(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status === 'DELETED') throw new NotFoundException('Account not found.');

    const blockers = await this.findBlockers(this.prisma, user);
    return {
      canDelete: blockers.length === 0,
      blockers,
      reasons: DELETION_REASONS,
      confirmationWord: DELETION_CONFIRMATION_WORD,
      emailHint: maskEmail(user.email),
    };
  }

  async deleteAccount(
    userId: string,
    dto: DeleteAccountDto,
    meta: { ipAddress?: string; userAgent?: string } = {},
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status === 'DELETED') throw new NotFoundException('Account not found.');

    if (dto.confirmation?.trim().toUpperCase() !== DELETION_CONFIRMATION_WORD) {
      throw new BadRequestException(`Type ${DELETION_CONFIRMATION_WORD} to confirm.`);
    }

    await this.verifyPassword(user.id, dto.password, user.passwordHash);

    const reason = DELETION_REASONS.find((item) => item.code === dto.reason);
    const comment = dto.comment?.trim() || undefined;

    // Taken before anything is removed: the confirmation goes to the address
    // the account had.
    const original = {
      email: user.email,
      fullName: user.fullName,
      memberSince: user.createdAt,
    };

    const unusablePassword = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
    const deletedAt = new Date();

    const audit = await this.prisma.$transaction(async (tx) => {
      // Checked again inside the transaction so a deposit or trade that
      // arrived since the screen loaded is not missed.
      const blockers = await this.findBlockers(tx, user);
      if (blockers.length) {
        throw new ConflictException({
          statusCode: 409,
          code: 'ACCOUNT_DELETION_BLOCKED',
          message: 'This account cannot be deleted yet.',
          blockers,
        });
      }

      // The status condition makes a double submit close the account once.
      const closed = await tx.user.updateMany({
        where: { id: user.id, status: { not: 'DELETED' } },
        data: {
          status: 'DELETED',
          email: `deleted-${user.id}@deleted.neurooption.invalid`,
          fullName: 'Deleted user',
          phone: null,
          referralCode: null,
          passwordHash: unusablePassword,
        },
      });
      if (closed.count !== 1) throw new NotFoundException('Account not found.');

      await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await tx.socialFollow.updateMany({
        where: { OR: [{ followerUserId: user.id }, { traderUserId: user.id }] },
        data: { status: 'STOPPED' },
      });
      await tx.affiliate.updateMany({ where: { userId: user.id }, data: { status: 'DISABLED' } });

      return tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'ACCOUNT_DELETED',
          targetType: 'User',
          targetId: user.id,
          description: 'Account deleted by its owner.',
          metadata: {
            reason: reason?.code ?? null,
            comment: comment ?? null,
            deletedAt: deletedAt.toISOString(),
          },
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent?.slice(0, 300),
        },
      });
    });

    this.passwordFailures.delete(user.id);
    const reference = `DEL-${audit.id.slice(0, 8).toUpperCase()}`;

    // The account is already closed; a mail failure must not undo that, but
    // the person is told honestly whether the confirmation went out.
    let emailSent = false;
    try {
      emailSent = await this.emails.sendAccountDeletionEmail({
        email: original.email,
        fullName: original.fullName,
        reference,
        deletedAt,
        reasonLabel: reason?.label,
      });
    } catch (error) {
      this.logger.error(`Deletion email for ${reference} failed: ${(error as Error).message}`);
    }

    await this.prisma.auditLog
      .update({
        where: { id: audit.id },
        data: {
          metadata: {
            reason: reason?.code ?? null,
            comment: comment ?? null,
            deletedAt: deletedAt.toISOString(),
            emailSent,
          },
        },
      })
      .catch(() => undefined);

    return {
      success: true,
      message: 'Your account has been deleted.',
      reference,
      emailSent,
      emailHint: maskEmail(original.email),
    };
  }

  private async verifyPassword(userId: string, password: string, hash: string) {
    const now = Date.now();
    const entry = this.passwordFailures.get(userId);
    if (entry && now - entry.since <= PASSWORD_WINDOW_MS && entry.count >= MAX_PASSWORD_FAILURES) {
      throw new HttpException(
        'Too many incorrect passwords. Try again in a few minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const valid = await bcrypt.compare(password ?? '', hash).catch(() => false);
    if (valid) return;

    const fresh = entry && now - entry.since <= PASSWORD_WINDOW_MS ? entry : { count: 0, since: now };
    fresh.count += 1;
    this.passwordFailures.set(userId, fresh);
    throw new UnauthorizedException('That password is not correct.');
  }

  private async findBlockers(
    db: Db,
    user: { id: string; role: string },
  ): Promise<DeletionBlocker[]> {
    const blockers: DeletionBlocker[] = [];

    if (user.role !== 'USER') {
      blockers.push({
        code: 'STAFF_ACCOUNT',
        message: 'Staff accounts cannot be deleted here. Ask another administrator.',
      });
    }

    const [wallets, engineWallets, openEngineTrades, openTrades, withdrawals, deposits] =
      await Promise.all([
        db.wallet.findMany({ where: { userId: user.id } }),
        db.engineWallet.findMany({ where: { userId: user.id, accountType: 'QT Real' } }),
        db.engineTrade.count({ where: { userId: user.id, status: 'PENDING' } }),
        db.trade.count({ where: { userId: user.id, status: 'OPEN' } }),
        db.withdrawal.count({
          where: { userId: user.id, status: { in: ['PENDING', 'PROCESSING'] } },
        }),
        db.deposit.count({
          where: { userId: user.id, status: { in: ['PENDING', 'PROCESSING'] } },
        }),
      ]);

    const available = wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0);
    const locked = wallets.reduce((sum, wallet) => sum + Number(wallet.locked), 0);
    const engineBalance = engineWallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0);
    const engineLocked = engineWallets.reduce((sum, wallet) => sum + Number(wallet.locked), 0);

    const funds = available + engineBalance;
    if (funds >= DUST) {
      blockers.push({
        code: 'FUNDS',
        message: `Your real account still holds ${kes(available)}${engineBalance >= DUST ? ' plus funds in trading' : ''}. Withdraw it first so nothing is lost.`,
        action: { label: 'Withdraw funds', path: '/finance?tab=withdraw' },
      });
    }
    if (locked + engineLocked >= DUST) {
      blockers.push({
        code: 'LOCKED_FUNDS',
        message: 'Some of your money is reserved for a withdrawal or an open position. Wait until it settles.',
        action: { label: 'View transactions', path: '/finance?tab=history' },
      });
    }
    if (openEngineTrades + openTrades > 0) {
      const count = openEngineTrades + openTrades;
      blockers.push({
        code: 'OPEN_TRADES',
        message: `You have ${count} open trade${count === 1 ? '' : 's'}. Wait until ${count === 1 ? 'it expires' : 'they expire'}.`,
        action: { label: 'View open trades', path: '/open-trades' },
      });
    }
    if (withdrawals > 0) {
      blockers.push({
        code: 'PENDING_WITHDRAWAL',
        message: 'A withdrawal is still being processed. Wait until it is paid or declined.',
        action: { label: 'View transactions', path: '/finance?tab=history' },
      });
    }
    if (deposits > 0) {
      blockers.push({
        code: 'PENDING_DEPOSIT',
        message: 'A deposit is still being confirmed. Wait until it completes or fails.',
        action: { label: 'View transactions', path: '/finance?tab=history' },
      });
    }

    return blockers;
  }
}
