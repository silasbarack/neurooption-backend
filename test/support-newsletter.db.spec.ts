/// <reference types="jest" />
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { SupportService } from '../src/support/support.service';
import { AdminConsoleService } from '../src/admin/admin-console.service';
import { NewsletterService } from '../src/newsletter/newsletter.service';

/** Runs against PostgreSQL (DATABASE_URL), like the other database tests. */
const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('support tickets and newsletter with PostgreSQL', () => {
  const prisma = new PrismaClient();
  const emails = {
    sendSupportReplyEmail: jest.fn(async () => true),
    sendNewsletterWelcomeEmail: jest.fn(async () => true),
  };
  const support = new SupportService(prisma as never);
  const consoleService = new AdminConsoleService(prisma as never, emails as never);
  const newsletter = new NewsletterService(prisma as never, emails as never);
  const tag = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  let alice: string;
  let bob: string;
  let adminId: string;

  beforeAll(async () => {
    const hash = await bcrypt.hash('pw-123456', 4);
    alice = (await prisma.user.create({ data: { fullName: 'Alice Client', email: `alice-${tag}@test.example`, passwordHash: hash } })).id;
    bob = (await prisma.user.create({ data: { fullName: 'Bob Client', email: `bob-${tag}@test.example`, passwordHash: hash } })).id;
    adminId = (await prisma.admin.create({ data: { fullName: 'Support Lead', email: `lead-${tag}@test.example`, passwordHash: 'x', role: 'SUPPORT_ADMIN' } })).id;
  });
  afterAll(async () => { await prisma.$disconnect(); });

  it('lets a client open a ticket and keeps it private to them', async () => {
    const ticket = await support.create(alice, { subject: 'Deposit missing', message: 'I paid 1,000 KES and it is not showing.' });
    expect(ticket.status).toBe('PENDING_SUPPORT');
    expect(ticket.messages).toHaveLength(1);
    expect((await support.listMine(alice)).map((t) => t.id)).toContain(ticket.id);
    await expect(support.getMine(bob, ticket.id)).rejects.toThrow('Ticket not found');
    await expect(support.reply(bob, ticket.id, { message: 'hijack' })).rejects.toThrow('Ticket not found');
    await expect(support.create(alice, { subject: 'x', message: 'hello' })).rejects.toThrow('Subject');
  });

  it('records an admin reply, waits on the client, emails them, and the client sees it', async () => {
    const ticket = await support.create(alice, { subject: `Help ${tag}`, message: 'Please check my account.' });
    const admin = { id: adminId, fullName: 'Support Lead', email: `lead-${tag}@test.example`, role: 'SUPPORT_ADMIN' };
    await expect(consoleService.replyToTicket(admin, ticket.id, { message: ' ' })).rejects.toThrow('Write a reply');
    const result = await consoleService.replyToTicket(admin, ticket.id, { message: 'Your deposit is now credited.' });
    expect(result).toEqual({ success: true, status: 'PENDING_USER', emailSent: true });
    expect(emails.sendSupportReplyEmail).toHaveBeenCalledWith(`alice-${tag}@test.example`, 'Alice Client', `Help ${tag}`, 'Your deposit is now credited.', ticket.id, { userId: expect.any(String) });

    const seen = await support.getMine(alice, ticket.id);
    expect(seen.status).toBe('PENDING_USER');
    expect(seen.messages.map((m) => m.senderRole)).toEqual(['USER', 'ADMIN']);
    expect(seen.messages[1]).not.toHaveProperty('admin');

    const detail = await consoleService.ticketDetail(ticket.id);
    expect(detail.messages[1].admin?.fullName).toBe('Support Lead');

    await consoleService.replyToTicket(admin, ticket.id, { message: 'Closing this now.', close: true });
    expect((await support.getMine(alice, ticket.id)).status).toBe('CLOSED');
    const reopened = await support.reply(alice, ticket.id, { message: 'One more question.' });
    expect(reopened.status).toBe('PENDING_SUPPORT');
  });

  it('subscribes once, confirms by email, unsubscribes by token, and can resubscribe', async () => {
    const email = `News-${tag}@Test.example`;
    await expect(newsletter.subscribe({ email: 'not-an-email' }, `ip-${tag}`)).rejects.toThrow('valid email');
    await newsletter.subscribe({ email, source: 'homepage' }, `ip-${tag}`);
    await newsletter.subscribe({ email }, `ip-${tag}`);
    expect(emails.sendNewsletterWelcomeEmail).toHaveBeenCalledTimes(1);
    const row = await prisma.newsletterSubscriber.findUnique({ where: { email: email.toLowerCase() } });
    expect(row?.source).toBe('homepage');
    await newsletter.unsubscribe({ token: row!.unsubscribeToken });
    expect((await prisma.newsletterSubscriber.findUnique({ where: { email: email.toLowerCase() } }))?.unsubscribedAt).not.toBeNull();
    await expect(newsletter.unsubscribe({ token: 'x'.repeat(30) })).rejects.toThrow('not valid');
    await newsletter.subscribe({ email }, `ip2-${tag}`);
    expect(emails.sendNewsletterWelcomeEmail).toHaveBeenCalledTimes(2);
  });

  it('limits sign-up attempts per address', async () => {
    const ip = `burst-${tag}`;
    for (let i = 0; i < 5; i++) await newsletter.subscribe({ email: `burst${i}-${tag}@test.example` }, ip);
    await expect(newsletter.subscribe({ email: `burst9-${tag}@test.example` }, ip)).rejects.toThrow('Too many attempts');
  });
});
