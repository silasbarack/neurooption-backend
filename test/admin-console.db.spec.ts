/// <reference types="jest" />
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { AdminConsoleService } from '../src/admin/admin-console.service';
import { AdminService } from '../src/admin/admin.service';
import type { AdminIdentity } from '../src/admin/admin-session.guard';

/** Runs against PostgreSQL (DATABASE_URL), like the other database tests. */
const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('admin console with PostgreSQL', () => {
  const prisma = new PrismaClient();
  const sentReplies: unknown[] = [];
  const emails = { sendSupportReplyEmail: jest.fn(async (...args: unknown[]) => (sentReplies.push(args), true)) };
  const consoleService = new AdminConsoleService(prisma as never, emails as never);
  const admins = new AdminService(prisma as never, {} as never);
  const tag = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  let superAdmin: AdminIdentity;
  let userId: string;

  beforeAll(async () => {
    const created = await prisma.admin.create({
      data: { fullName: 'Console Owner', email: `owner-${tag}@test.example`, passwordHash: 'x', role: 'SUPER_ADMIN' },
    });
    superAdmin = { id: created.id, fullName: created.fullName, email: created.email, role: created.role };
    const user = await prisma.user.create({
      data: { fullName: `Console Client ${tag}`, email: `client-${tag}@test.example`, passwordHash: await bcrypt.hash('pw-123456', 4) },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('summarises users, queues and sign-ups', async () => {
    const data = await consoleService.overview();
    expect(data.users.total).toBeGreaterThan(0);
    expect(data.signups14d).toHaveLength(14);
    expect(data.signups14d.at(-1)!.signups).toBeGreaterThan(0);
    expect(data.queues).toHaveProperty('kycPending');
  });

  it('finds a user and shows the full profile', async () => {
    const list = await consoleService.listUsers({ search: `client-${tag}` });
    expect(list.items.map((u) => u.id)).toEqual([userId]);
    const detail = await consoleService.userDetail(userId);
    expect(detail.user.email).toBe(`client-${tag}@test.example`);
    expect(detail.tradeTotals.trades).toBe(0);
  });

  it('suspends with a reason, records it in the audit log, and reactivates', async () => {
    await expect(consoleService.setUserStatus(superAdmin, userId, { status: 'SUSPENDED' })).rejects.toThrow('reason');
    await consoleService.setUserStatus(superAdmin, userId, { status: 'SUSPENDED', reason: 'Chargeback review' });
    expect((await prisma.user.findUnique({ where: { id: userId } }))!.status).toBe('SUSPENDED');
    const audit = await consoleService.listAudit({ search: userId });
    expect(audit.items[0]).toMatchObject({ action: 'USER_STATUS_CHANGED', admin: { fullName: 'Console Owner' } });
    await consoleService.setUserStatus(superAdmin, userId, { status: 'ACTIVE' });
    expect((await prisma.user.findUnique({ where: { id: userId } }))!.status).toBe('ACTIVE');
  });

  it('reviews a pending KYC submission once', async () => {
    const record = await prisma.kycRecord.create({ data: { userId, documentType: 'NATIONAL_ID', status: 'PENDING' } });
    const pending = await consoleService.listKyc({});
    expect(pending.items.some((r) => r.id === record.id)).toBe(true);
    await expect(consoleService.reviewKyc(superAdmin, record.id, { decision: 'REJECT' })).rejects.toThrow('reason');
    await consoleService.reviewKyc(superAdmin, record.id, { decision: 'APPROVE' });
    expect((await prisma.user.findUnique({ where: { id: userId } }))!.kycStatus).toBe('APPROVED');
    await expect(consoleService.reviewKyc(superAdmin, record.id, { decision: 'APPROVE' })).rejects.toThrow('already been reviewed');
  });

  it('lists deposits and withdrawals and support tickets', async () => {
    const deposits = await consoleService.listFinance({ kind: 'deposits', search: `client-${tag}` });
    expect(deposits).toMatchObject({ kind: 'deposits', total: 0 });
    const ticket = await prisma.supportTicket.create({ data: { userId, subject: `Help ${tag}` } });
    const tickets = await consoleService.listTickets({ search: tag });
    expect(tickets.items[0].id).toBe(ticket.id);
    await consoleService.setTicketStatus(superAdmin, ticket.id, { status: 'CLOSED' });
    expect((await consoleService.ticketDetail(ticket.id)).status).toBe('CLOSED');
  });

  it('enforces role permissions per area', () => {
    const support: AdminIdentity = { ...superAdmin, role: 'SUPPORT_ADMIN' };
    expect(() => consoleService.assertCan(support, 'support')).not.toThrow();
    expect(() => consoleService.assertCan(support, 'finance')).toThrow('cannot use this area');
    expect(consoleService.permissionsFor('KYC_ADMIN')).toEqual(['overview', 'users', 'kyc']);
  });

  it('protects the team: no self-lockout, no removing the last Super Administrator', async () => {
    await expect(admins.disable(superAdmin.id, superAdmin.id)).rejects.toThrow('your own');
    const other = await admins.create({ fullName: 'Second Admin', email: `Second-${tag}@Test.example`, password: 'An0ther!Strong#Pass', role: 'SUPPORT_ADMIN' as never });
    expect(other.email).toBe(`second-${tag}@test.example`);
    await expect(admins.create({ fullName: 'Weak', email: `weak-${tag}@test.example`, password: 'password', role: 'SUPPORT_ADMIN' as never })).rejects.toThrow('14–128');
    await admins.disable(superAdmin.id, other.id);
    await admins.delete(superAdmin.id, other.id);
    expect(await prisma.admin.findUnique({ where: { id: other.id } })).toBeNull();
  });
});
