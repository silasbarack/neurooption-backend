import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { EmailOutbox, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../config/prisma.service';
import { EmailsService, EmailTemplate } from './emails.service';

export type QueuedAccountEmail = {
  userId: string;
  kind: 'ACCOUNT_CREATED' | 'PASSWORD_RECOVERY' | 'PASSWORD_CHANGED' | 'ACCOUNT_DELETED';
  deduplicationKey: string;
  recipient: string;
  template: EmailTemplate;
  expiresAt?: Date;
  resetTokenId?: string;
};

@Injectable()
export class EmailOutboxService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(EmailOutboxService.name);
  private interval?: ReturnType<typeof setInterval>;
  private busy = false;

  constructor(private readonly prisma: PrismaService, private readonly emails: EmailsService) {}

  onApplicationBootstrap() {
    if (!process.env.DATABASE_URL?.trim()) return;
    this.interval = setInterval(() => this.kick(), 5000);
    this.interval.unref();
    this.kick();
  }

  onModuleDestroy() { if (this.interval) clearInterval(this.interval); }

  enqueue(tx: Prisma.TransactionClient, email: QueuedAccountEmail) {
    return tx.emailOutbox.create({
      data: {
        userId: email.userId, kind: email.kind, deduplicationKey: email.deduplicationKey,
        recipient: email.recipient, subject: email.template.subject,
        body: email.template.body, html: email.template.html,
        expiresAt: email.expiresAt, resetTokenId: email.resetTokenId,
      },
    });
  }

  cancel(tx: Prisma.TransactionClient, userId: string, kind?: QueuedAccountEmail['kind']) {
    return tx.emailOutbox.updateMany({
      where: { userId, ...(kind ? { kind } : {}), status: { in: ['PENDING', 'PROCESSING'] } },
      data: { status: 'CANCELLED', recipient: null, body: null, html: null, leaseToken: null, lockedUntil: null },
    });
  }

  kick() {
    void this.processPending().catch((error: unknown) => {
      const code = (error as { code?: string })?.code || 'OUTBOX_ERROR';
      this.logger.error('Account email worker failed (' + code + ').');
    });
  }

  async processPending(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    try {
      const now = new Date();
      const jobs = await this.prisma.emailOutbox.findMany({
        where: { OR: [
          { status: 'PENDING', nextAttemptAt: { lte: now } },
          { status: 'PROCESSING', lockedUntil: { lte: now } },
        ] },
        orderBy: { createdAt: 'asc' }, take: 10,
      });
      for (const job of jobs) await this.processJob(job);
    } finally {
      this.busy = false;
    }
  }

  private async processJob(job: EmailOutbox): Promise<void> {
    const now = new Date();
    const leaseToken = randomUUID();
    const claimed = await this.prisma.emailOutbox.updateMany({
      where: { id: job.id, OR: [
        { status: 'PENDING', nextAttemptAt: { lte: now } },
        { status: 'PROCESSING', lockedUntil: { lte: now } },
      ] },
      data: { status: 'PROCESSING', leaseToken, lockedUntil: new Date(now.getTime() + 120000), attempts: { increment: 1 } },
    });
    if (claimed.count !== 1) return;
    const owned = { id: job.id, status: 'PROCESSING', leaseToken };
    const user = job.kind === 'ACCOUNT_DELETED' ? null :
      await this.prisma.user.findUnique({ where: { id: job.userId || '' }, select: { deletedAt: true, status: true } });
    const reset = job.resetTokenId ?
      await this.prisma.passwordResetToken.findUnique({ where: { id: job.resetTokenId } }) : null;
    if (!job.recipient || !job.body || (job.expiresAt && job.expiresAt <= now) ||
      (job.kind !== 'ACCOUNT_DELETED' && (!user || user.deletedAt || user.status === 'DELETED')) ||
      (job.resetTokenId && (!reset || reset.used || reset.expiresAt <= now))) {
      await this.prisma.emailOutbox.updateMany({
        where: owned,
        data: { status: 'CANCELLED', recipient: null, body: null, html: null, leaseToken: null, lockedUntil: null },
      });
      return;
    }

    let accepted = false;
    try {
      accepted = await this.emails.sendTemplateEmail(job.recipient, {
        subject: job.subject, body: job.body, html: job.html || undefined,
      });
    } catch {
      accepted = false;
    }
    if (accepted) {
      await this.prisma.emailOutbox.updateMany({
        where: owned,
        data: {
          status: 'SENT', acceptedAt: new Date(), recipient: null, body: null, html: null,
          leaseToken: null, lockedUntil: null, lastError: null,
        },
      });
      return;
    }
    const delay = Math.min(15 * 60 * 1000, 5000 * 2 ** Math.min(job.attempts, 8));
    await this.prisma.emailOutbox.updateMany({
      where: owned,
      data: {
        status: 'PENDING', leaseToken: null, lockedUntil: null,
        nextAttemptAt: new Date(Date.now() + delay), lastError: 'Email provider did not accept the message.',
      },
    });
    this.logger.warn('Account email job ' + job.id + ' was not accepted; retry scheduled (attempt ' + (job.attempts + 1) + ').');
  }
}
