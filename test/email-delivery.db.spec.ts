/// <reference types="jest" />
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaClient, TransactionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

import { AuthService } from '../src/auth/auth.service';
import { DepositsService } from '../src/deposits/deposits.service';
import { EmailWebhooksController } from '../src/emails/email-webhooks.controller';
import { EmailsService } from '../src/emails/emails.service';
import { KycService } from '../src/kyc/kyc.service';
import { ProfileController } from '../src/profile/profile.controller';
import { UsersService } from '../src/users/users.service';
import { WithdrawalsService } from '../src/withdrawals/withdrawals.service';

/**
 * End-to-end checks of the email pipeline against PostgreSQL, with the
 * Brevo HTTP API mocked (no real email leaves the machine).
 */
const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

type Call = { to: string; subject: string; html: string; text: string; sender: { email: string } };

describeDb('email delivery pipeline (Brevo mocked)', () => {
  const prisma = new PrismaClient();
  const envKeys = ['EMAIL_PROVIDER', 'BREVO_API_KEY', 'EMAIL_FROM', 'FRONTEND_URL', 'BREVO_WEBHOOK_TOKEN', 'SMTP_SERVICE', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'RESEND_API_KEY'];
  const savedEnv = Object.fromEntries(envKeys.map((k) => [k, process.env[k]]));
  const tag = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  let emails: EmailsService;
  let calls: Call[];
  let responder: (call: Call) => { status: number; body: unknown } | Error;

  const fetchMock = jest.fn(async (url: string, init?: { body?: string }) => {
    if (!String(url).includes('/v3/smtp/email')) return new Response('{}', { status: 200 });
    const payload = JSON.parse(init?.body || '{}');
    const call: Call = { to: payload.to[0].email, subject: payload.subject, html: payload.htmlContent, text: payload.textContent, sender: payload.sender };
    calls.push(call);
    const result = responder(call);
    if (result instanceof Error) throw result;
    return new Response(JSON.stringify(result.body), { status: result.status });
  });

  const newUser = async (label: string) =>
    prisma.user.create({ data: { fullName: `Mail ${label}`, email: `mail-${label}-${tag}@test.example`, passwordHash: await bcrypt.hash('pw-123456', 4) } });
  const lastMessage = (to: string) => prisma.emailMessage.findFirst({ where: { recipient: to }, orderBy: { createdAt: 'desc' } });

  beforeAll(() => {
    for (const k of envKeys) delete process.env[k];
    Object.assign(process.env, {
      EMAIL_PROVIDER: 'brevo',
      BREVO_API_KEY: 'test-key-not-real',
      EMAIL_FROM: '"NeuroOption" <no-reply@neurooption.com>',
      FRONTEND_URL: 'https://neurooption.com',
      BREVO_WEBHOOK_TOKEN: 'a-long-webhook-secret-for-tests-123',
    });
    (global as unknown as { fetch: unknown }).fetch = fetchMock;
  });
  beforeEach(() => {
    calls = [];
    let n = 0;
    responder = () => ({ status: 201, body: { messageId: `<msg-${tag}-${++n}@smtp-relay.brevo.com>` } });
    emails = new EmailsService(prisma as never);
  });
  afterAll(async () => {
    for (const k of envKeys) {
      if (savedEnv[k] === undefined) delete process.env[k];
      else process.env[k] = savedEnv[k];
    }
    await prisma.$disconnect();
  });

  it('registration: validates, prevents duplicates, sends a branded welcome with a production verification link', async () => {
    const auth = new AuthService(prisma as never, { sign: () => 'jwt' } as never, emails, {} as never);
    await expect(auth.register({ email: 'not-an-email', password: 'pw-123456', fullName: 'X' })).rejects.toThrow('valid email');
    const email = `reg-${tag}@test.example`;
    const result = await auth.register({ email: email.toUpperCase(), password: 'pw-123456', fullName: 'Reg User' });
    expect(result.welcomeEmailSent).toBe(true);
    await expect(auth.register({ email, password: 'pw-123456', fullName: 'Again' })).rejects.toThrow('already exists');

    const sent = calls.find((c) => c.to === email)!;
    expect(sent.sender.email).toBe('no-reply@neurooption.com');
    expect(sent.subject).toBe('Welcome to NeuroOption - your account is ready');
    const link = sent.html.match(/https:\/\/neurooption\.com\/verify-email\?token=([A-Za-z0-9_-]+)/);
    expect(link).not.toBeNull();
    expect(sent.text).toContain(link![0]);
    expect(sent.html).toContain('https://neurooption.com/brand/neurooption-logo-email.png');
    expect(sent.html).not.toMatch(/undefined|__NEUROOPTION_LOGO_SRC__/);

    // Only a hash of the token is stored; the email record keeps no body.
    const user = await prisma.user.findUnique({ where: { email } });
    const tokenRow = await prisma.emailVerificationToken.findFirst({ where: { userId: user!.id } });
    expect(tokenRow!.tokenHash).toBe(createHash('sha256').update(link![1]).digest('hex'));
    const record = await lastMessage(email);
    expect(record).toMatchObject({ kind: 'welcome', status: 'ACCEPTED', provider: 'brevo', retryable: false, textBody: null, htmlBody: null });
    expect(record!.providerMessageId).toMatch(/^<msg-/);
  });

  it('verification: works once, rejects reuse/expired/unknown tokens, and rate-limits resends', async () => {
    const auth = new AuthService(prisma as never, { sign: () => 'jwt' } as never, emails, {} as never);
    const user = await newUser('verify');
    const first = await auth.resendVerification(user.id);
    expect(first.emailSent).toBe(true);
    await expect(auth.resendVerification(user.id)).rejects.toThrow('wait a minute');
    const token = calls[0].html.match(/verify-email\?token=([A-Za-z0-9_-]+)/)![1];

    await expect(auth.verifyEmail({ token: 'x'.repeat(43) })).rejects.toThrow('not valid');
    expect(await auth.verifyEmail({ token })).toMatchObject({ success: true, alreadyVerified: false });
    expect((await prisma.user.findUnique({ where: { id: user.id } }))!.emailVerifiedAt).not.toBeNull();
    expect(await auth.verifyEmail({ token })).toMatchObject({ alreadyVerified: true });
    expect(await auth.resendVerification(user.id)).toMatchObject({ alreadyVerified: true, emailSent: false });

    const other = await newUser('expired');
    const hash = createHash('sha256').update(`expired-token-${tag}`).digest('hex');
    await prisma.emailVerificationToken.create({ data: { userId: other.id, tokenHash: hash, expiresAt: new Date(Date.now() - 1000) } });
    await expect(auth.verifyEmail({ token: `expired-token-${tag}` })).rejects.toThrow('expired');
  });

  it('a link whose email failed does not block an immediate resend', async () => {
    const auth = new AuthService(prisma as never, { sign: () => 'jwt' } as never, emails, {} as never);
    responder = () => ({ status: 400, body: { message: 'invalid' } });
    const email = `reg-fail-${tag}@test.example`;
    expect((await auth.register({ email, password: 'pw-123456', fullName: 'Fail First' })).welcomeEmailSent).toBe(false);
    const user = await prisma.user.findUnique({ where: { email } });
    expect(await prisma.emailVerificationToken.count({ where: { userId: user!.id } })).toBe(0);
    responder = () => ({ status: 201, body: { messageId: `<later-${tag}@smtp-relay.brevo.com>` } });
    expect(await auth.resendVerification(user!.id)).toMatchObject({ emailSent: true });
  });

  it('password reset: code email is sensitive (never stored); confirmation includes the time and no password', async () => {
    const auth = new AuthService(prisma as never, { sign: () => 'jwt' } as never, emails, {} as never);
    const user = await newUser('reset');
    await auth.forgotPassword({ email: user.email });
    const codeMail = calls.find((c) => c.subject === 'Your NeuroOption verification code')!;
    const code = codeMail.text.match(/\b(\d{6})\b/)![1];
    expect(await lastMessage(user.email)).toMatchObject({ kind: 'password_code', status: 'ACCEPTED', textBody: null, htmlBody: null, retryable: false });
    // Unknown address: same answer, nothing sent.
    const before = calls.length;
    expect((await auth.forgotPassword({ email: `nobody-${tag}@test.example` })).success).toBe(true);
    expect(calls.length).toBe(before);

    await auth.resetPassword({ email: user.email, code, password: 'new-secret-99' });
    const changed = calls.find((c) => c.subject === 'Your NeuroOption password was changed')!;
    expect(changed.text).toMatch(/changed on .*EAT \(UTC\+3\)/);
    expect(changed.text).not.toContain('new-secret-99');
    expect(changed.html).toContain('https://neurooption.com/forgot-password');
    await expect(auth.resetPassword({ email: user.email, code, password: 'again-12345' })).rejects.toThrow('Invalid or expired');
  });

  it('self-service password change notifies; email changes are refused', async () => {
    const users = new UsersService(prisma as never, emails);
    const user = await newUser('pwchange');
    await expect(users.changePassword(user.id, { currentPassword: 'wrong', newPassword: 'brand-new-pass' })).rejects.toThrow('incorrect');
    expect(await users.changePassword(user.id, { currentPassword: 'pw-123456', newPassword: 'brand-new-pass' })).toMatchObject({ success: true, emailSent: true });
    expect(await lastMessage(user.email)).toMatchObject({ kind: 'password_changed', status: 'ACCEPTED' });
    await expect(users.updateMe(user.id, { email: `attacker-${tag}@evil.example` })).rejects.toThrow('contact Support');
  });

  it('legacy /profile routes only serve the signed-in owner', () => {
    const controller = new ProfileController({ getProfile: jest.fn(), updateProfile: jest.fn(), changePassword: jest.fn() } as never);
    const req = { user: { id: 'owner' } } as never;
    expect(() => controller.getProfile(req, 'someone-else')).toThrow(ForbiddenException);
    expect(() => controller.updateProfile(req, 'someone-else', {} as never)).toThrow(ForbiddenException);
    expect(() => controller.changePassword(req, 'someone-else', {} as never)).toThrow(ForbiddenException);
  });

  it('KYC: submitted, approved and rejected emails reflect the real status, once each', async () => {
    const kyc = new KycService(prisma as never, emails);
    const user = await newUser('kyc');
    const record = await kyc.submit({ userId: user.id, documentType: 'NATIONAL_ID', documentNumber: '12345678' } as never);
    await kyc.reject(record.id, { rejectionReason: 'Photo is blurred' } as never);
    await kyc.approve(record.id, {} as never);
    await kyc.approve(record.id, {} as never); // repeated action: no second email
    const subjects = calls.filter((c) => c.to === user.email).map((c) => c.subject);
    expect(subjects).toHaveLength(3);
    expect(calls.find((c) => /reason/i.test(c.text) && c.to === user.email)!.text).toContain('Photo is blurred');
    const kinds = (await prisma.emailMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } })).map((m) => m.kind);
    expect(kinds).toEqual(['kyc_submitted', 'kyc_rejected', 'kyc_approved']);
  });

  it('money: deposit and withdrawal emails use the stored amounts, and each event emails once', async () => {
    const user = await newUser('money');
    const deposits = new DepositsService(prisma as never, {} as never, emails);
    const withdrawals = new WithdrawalsService(prisma as never, {} as never, emails);
    const row = (id: string, ref: string | null) => ({
      id, amount: 1500, currency: 'KES', externalRef: ref, updatedAt: new Date('2026-10-15T09:00:00Z'),
      user: { id: user.id, email: user.email, fullName: user.fullName }, gateway: { name: 'M-Pesa' },
    });
    const notifyDeposit = (deposits as unknown as { notifyClient: (r: unknown, s: TransactionStatus, d?: string) => Promise<void> }).notifyClient.bind(deposits);
    const notifyWithdrawal = (withdrawals as unknown as { notifyClient: (r: unknown, s: TransactionStatus, d?: string) => Promise<void> }).notifyClient.bind(withdrawals);

    await notifyDeposit(row(`dep-pending-${tag}`, null), TransactionStatus.PENDING); // nothing before confirmation
    expect(calls).toHaveLength(0);
    await notifyDeposit(row(`dep-ok-${tag}`, 'SJK12AB34C'), TransactionStatus.COMPLETED);
    await notifyDeposit(row(`dep-ok-${tag}`, 'SJK12AB34C'), TransactionStatus.COMPLETED); // duplicate callback
    await notifyDeposit(row(`dep-fail-${tag}`, null), TransactionStatus.FAILED, 'Request cancelled by user');
    for (const s of [TransactionStatus.PENDING, TransactionStatus.PROCESSING, TransactionStatus.COMPLETED]) await notifyWithdrawal(row(`wd-${tag}`, 'MPESA-REF-1'), s);
    await notifyWithdrawal(row(`wd2-${tag}`, null), TransactionStatus.REJECTED, 'Name does not match the account');

    expect(calls.map((c) => c.subject)).toEqual([
      'NeuroOption Deposit Successful',
      'NeuroOption Deposit Not Completed',
      expect.stringMatching(/Withdrawal/),
      expect.stringMatching(/Withdrawal/),
      expect.stringMatching(/Withdrawal/),
      expect.stringMatching(/Withdrawal/),
    ]);
    expect(calls[0].text).toContain('1500 KES');
    expect(calls[0].text).toContain('SJK12AB34C');
    expect(calls[1].text).toContain('Request cancelled by user');
    expect(calls[5].text).toContain('Name does not match the account');
  });

  it('provider authentication failure is permanent: one attempt, FAILED, no retry, no secret in the error', async () => {
    responder = () => ({ status: 401, body: { code: 'unauthorized', message: 'Key not found test-key-not-real' } });
    const to = `auth-fail-${tag}@test.example`;
    expect(await emails.sendKycApprovedEmail(to, 'A')).toBe(false);
    expect(calls).toHaveLength(1);
    const record = await lastMessage(to);
    expect(record).toMatchObject({ status: 'FAILED', attempts: 1, textBody: null, nextAttemptAt: null });
    expect(record!.lastError).toContain('HTTP 401');
    expect(record!.lastError).not.toContain('test-key-not-real');
  });

  it('temporary outage: retries in-process, then queues non-sensitive mail; the worker delivers it later', async () => {
    responder = () => ({ status: 503, body: { message: 'Service Unavailable' } });
    const to = `outage-${tag}@test.example`;
    expect(await emails.sendSupportReplyEmail(to, 'A', 'Help', 'We fixed it.', 'ticket-1')).toBe(false);
    expect(calls).toHaveLength(3); // 1 + 2 quick retries
    let record = await lastMessage(to);
    expect(record).toMatchObject({ status: 'QUEUED', attempts: 3 });
    expect(record!.htmlBody).toContain('We fixed it.');

    responder = () => ({ status: 201, body: { messageId: `<retry-${tag}@smtp-relay.brevo.com>` } });
    const sent = await emails.processRetryQueue(new Date(Date.now() + 2 * 60_000));
    expect(sent).toBeGreaterThanOrEqual(1);
    record = await prisma.emailMessage.findUnique({ where: { id: record!.id } });
    expect(record).toMatchObject({ status: 'ACCEPTED', attempts: 4, textBody: null, htmlBody: null, providerMessageId: `<retry-${tag}@smtp-relay.brevo.com>` });
  });

  it('timeouts on a sensitive email are retried in-process only and never stored for later', async () => {
    responder = () => new TypeError('fetch failed: ETIMEDOUT');
    const to = `timeout-${tag}@test.example`;
    expect(await emails.sendPasswordRecoveryCodeEmail(to, '654321', 'A')).toBe(false);
    expect(calls).toHaveLength(3);
    expect(await lastMessage(to)).toMatchObject({ status: 'FAILED', textBody: null, htmlBody: null, retryable: false });
  });

  it('missing configuration: nothing is claimed as sent and the failure is recorded', async () => {
    delete process.env.BREVO_API_KEY;
    const unconfigured = new EmailsService(prisma as never);
    const to = `noconfig-${tag}@test.example`;
    expect(await unconfigured.sendKycApprovedEmail(to, 'A')).toBe(false);
    expect(calls).toHaveLength(0);
    expect(await lastMessage(to)).toMatchObject({ status: 'FAILED', lastError: 'No email provider configured.' });
    process.env.BREVO_API_KEY = 'test-key-not-real';
  });

  it('delivery webhook: needs the secret, then records delivered and bounced events', async () => {
    const controller = new EmailWebhooksController(emails);
    const to = `hook-${tag}@test.example`;
    await emails.sendKycApprovedEmail(to, 'A');
    const record = await lastMessage(to);
    await expect(controller.brevo('wrong-token-wrong-token-wrong', { event: 'delivered', 'message-id': record!.providerMessageId })).rejects.toThrow(ForbiddenException);
    expect(await controller.brevo(process.env.BREVO_WEBHOOK_TOKEN, { event: 'delivered', 'message-id': record!.providerMessageId })).toEqual({ received: 1, matched: 1 });
    expect(await prisma.emailMessage.findUnique({ where: { id: record!.id } })).toMatchObject({ status: 'DELIVERED', lastEvent: 'delivered' });
    await controller.brevo(process.env.BREVO_WEBHOOK_TOKEN, [{ event: 'hard_bounce', 'message-id': record!.providerMessageId }]);
    expect(await prisma.emailMessage.findUnique({ where: { id: record!.id } })).toMatchObject({ status: 'BOUNCED' });

    const saved = process.env.BREVO_WEBHOOK_TOKEN;
    delete process.env.BREVO_WEBHOOK_TOKEN;
    await expect(controller.brevo('anything', {})).rejects.toThrow(NotFoundException);
    process.env.BREVO_WEBHOOK_TOKEN = saved;
  });

  it('configuration warnings flag a Gmail sender on an API provider and a missing FRONTEND_URL', () => {
    process.env.EMAIL_FROM = '"NeuroOption" <someone@gmail.com>';
    const savedUrl = process.env.FRONTEND_URL;
    delete process.env.FRONTEND_URL;
    const warnings = new EmailsService().configurationWarnings().join(' ');
    expect(warnings).toMatch(/gmail\.com.*DMARC/);
    expect(warnings).toMatch(/FRONTEND_URL is not set/);
    process.env.EMAIL_FROM = '"NeuroOption" <no-reply@neurooption.com>';
    process.env.FRONTEND_URL = savedUrl;
    expect(new EmailsService().configurationWarnings()).toEqual([]);
  });

  it('every template renders: subject, plain text, branded HTML, production links, no placeholders', () => {
    const e = new EmailsService();
    const money = { amount: 1000, currency: 'KES', method: 'M-Pesa', transactionId: 'SJK1', dateTime: '15 October 2026, 12:00 EAT' };
    const templates = [
      e.accountCreated('a@b.co', 'Ann', 'https://neurooption.com/verify-email?token=abc'),
      e.accountCreated('a@b.co', 'Ann'),
      e.emailVerification('Ann', 'https://neurooption.com/verify-email?token=abc'),
      e.passwordRecoveryCode('123456', 'Ann'),
      e.passwordChanged('Ann', new Date()),
      e.accountDeletionConfirmed({ email: 'a@b.co', fullName: 'Ann', reference: 'DEL-1', deletedAt: new Date(), reasonLabel: 'Other' }),
      e.supportReply('Ann', 'Help', 'Reply', 't1'),
      e.newsletterWelcome('tok'),
      e.depositSuccessful(money),
      e.depositFailed({ ...money, reason: 'Cancelled' }),
      e.withdrawalRequested(money),
      e.withdrawalProcessing(money),
      e.withdrawalCompleted(money),
      e.withdrawalDeclined({ ...money, reason: 'Mismatch' }),
      e.kycSubmitted('Ann'),
      e.kycApproved('Ann'),
      e.kycRejected('Ann', 'Blurred'),
    ];
    for (const t of templates) {
      expect(t.subject.length).toBeGreaterThan(5);
      expect(t.body.length).toBeGreaterThan(20);
      expect(t.html).toContain('<!doctype html>');
      expect(t.html).toContain('__NEUROOPTION_LOGO_SRC__');
      expect(`${t.html}${t.body}`).not.toMatch(/undefined|NaN|\[object Object\]/);
      expect(`${t.html}${t.body}`).not.toContain('onrender.com');
    }
  });
});
