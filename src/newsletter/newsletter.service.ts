import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);
  private readonly attempts = new Map<string, { count: number; since: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly emails: EmailsService,
  ) {}

  private throttle(key: string) {
    const now = Date.now();
    const prior = this.attempts.get(key);
    const bucket = prior && now - prior.since < WINDOW_MS ? prior : { count: 0, since: now };
    if (bucket.count >= MAX_PER_WINDOW) {
      throw new HttpException('Too many attempts. Please try again in a minute.', HttpStatus.TOO_MANY_REQUESTS);
    }
    bucket.count += 1;
    this.attempts.set(key, bucket);
    if (this.attempts.size > 5000) this.attempts.clear();
  }

  /**
   * Adds (or re-activates) a subscription. The reply is the same whether or
   * not the address was already subscribed, so it can't be used to look up
   * who is on the list. A confirmation email goes out to new sign-ups only.
   */
  async subscribe(body: { email?: unknown; source?: unknown }, ip: string) {
    this.throttle(ip || 'unknown');
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!EMAIL_RE.test(email) || email.length > 254) throw new BadRequestException('Enter a valid email address.');
    const source = typeof body?.source === 'string' ? body.source.slice(0, 40) : null;

    const existing = await this.prisma.newsletterSubscriber.findUnique({ where: { email } });
    let token: string | null = null;
    if (!existing) {
      token = randomBytes(24).toString('base64url');
      await this.prisma.newsletterSubscriber.create({ data: { email, source, unsubscribeToken: token } });
    } else if (existing.unsubscribedAt) {
      token = existing.unsubscribeToken;
      await this.prisma.newsletterSubscriber.update({ where: { email }, data: { unsubscribedAt: null, source } });
    }
    if (token) {
      void this.emails.sendNewsletterWelcomeEmail(email, token).catch((error) => {
        this.logger.warn(`Newsletter confirmation not sent: ${error instanceof Error ? error.message : error}`);
      });
    }
    return { success: true, message: "You're subscribed. Check your inbox for a confirmation." };
  }

  async unsubscribe(body: { token?: unknown }) {
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    if (token.length < 16 || token.length > 100) throw new BadRequestException('This unsubscribe link is not valid.');
    const result = await this.prisma.newsletterSubscriber.updateMany({
      where: { unsubscribeToken: token, unsubscribedAt: null },
      data: { unsubscribedAt: new Date() },
    });
    if (result.count === 0) {
      const known = await this.prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token }, select: { id: true } });
      if (!known) throw new BadRequestException('This unsubscribe link is not valid.');
    }
    return { success: true, message: 'You have been unsubscribed from NeuroOption updates.' };
  }
}
