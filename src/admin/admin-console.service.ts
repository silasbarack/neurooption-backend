import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import type { AdminIdentity } from './admin-session.guard';

const DAY = 24 * 60 * 60 * 1000;

/** Which administrator roles may use each console area (SUPER_ADMIN may use all). */
export const CONSOLE_PERMISSIONS = {
  overview: ['SUPER_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'KYC_ADMIN', 'RISK_ADMIN', 'COMPLIANCE_ADMIN'],
  users: ['SUPER_ADMIN', 'SUPPORT_ADMIN', 'KYC_ADMIN', 'RISK_ADMIN', 'COMPLIANCE_ADMIN', 'FINANCE_ADMIN'],
  userStatus: ['SUPER_ADMIN', 'RISK_ADMIN', 'COMPLIANCE_ADMIN'],
  kyc: ['SUPER_ADMIN', 'KYC_ADMIN', 'COMPLIANCE_ADMIN'],
  finance: ['SUPER_ADMIN', 'FINANCE_ADMIN', 'COMPLIANCE_ADMIN'],
  trading: ['SUPER_ADMIN', 'RISK_ADMIN', 'COMPLIANCE_ADMIN', 'FINANCE_ADMIN'],
  support: ['SUPER_ADMIN', 'SUPPORT_ADMIN'],
  audit: ['SUPER_ADMIN', 'COMPLIANCE_ADMIN'],
  team: ['SUPER_ADMIN'],
} as const;
export type ConsoleArea = keyof typeof CONSOLE_PERMISSIONS;

const USER_STATUSES = ['ACTIVE', 'PENDING_KYC', 'SUSPENDED', 'LOCKED', 'DELETED'] as const;
const SETTABLE_STATUSES = ['ACTIVE', 'SUSPENDED', 'LOCKED'] as const;
const KYC_STATUSES = ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'] as const;
const MONEY_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED', 'CANCELLED'] as const;
const TICKET_STATUSES = ['OPEN', 'PENDING_USER', 'PENDING_SUPPORT', 'CLOSED'] as const;

type PageQuery = { page?: string; limit?: string };

const num = (value: Prisma.Decimal | number | null | undefined) => (value === null || value === undefined ? 0 : Number(value));

function pageOf(query: PageQuery, maxLimit = 50) {
  const page = Number(query.page || '1');
  const limit = Number(query.limit || '20');
  if (!Number.isInteger(page) || page < 1 || page > 100000 || !Number.isInteger(limit) || limit < 1 || limit > maxLimit) {
    throw new BadRequestException('Invalid pagination.');
  }
  return { page, limit, skip: (page - 1) * limit };
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], label: string): T | undefined {
  if (!value || value === 'all') return undefined;
  const upper = value.toUpperCase() as T;
  if (!allowed.includes(upper)) throw new BadRequestException(`Invalid ${label}.`);
  return upper;
}

function searchText(value: string | undefined): string {
  const text = (value || '').trim();
  if (text.length > 80) throw new BadRequestException('Search is too long.');
  return text;
}

function reasonText(value: unknown, required: boolean): string | null {
  const text = typeof value === 'string' ? value.trim() : '';
  if (required && text.length < 3) throw new BadRequestException('Give a reason of at least 3 characters.');
  if (text.length > 500) throw new BadRequestException('Reason is too long (500 characters max).');
  return text || null;
}

@Injectable()
export class AdminConsoleService {
  constructor(private readonly prisma: PrismaService) {}

  assertCan(admin: AdminIdentity, area: ConsoleArea): void {
    if (!(CONSOLE_PERMISSIONS[area] as readonly string[]).includes(admin.role)) {
      throw new ForbiddenException('Your administrator role cannot use this area.');
    }
  }

  /** The console areas this administrator may open, so the UI can hide the rest. */
  permissionsFor(role: string): ConsoleArea[] {
    return (Object.keys(CONSOLE_PERMISSIONS) as ConsoleArea[]).filter((area) =>
      (CONSOLE_PERMISSIONS[area] as readonly string[]).includes(role),
    );
  }

  private audit(admin: AdminIdentity, action: string, targetType: string, targetId: string, description: string, metadata?: Prisma.InputJsonValue, userId?: string) {
    return this.prisma.auditLog.create({
      data: { adminId: admin.id, userId: userId ?? null, action, targetType, targetId, description, metadata },
    });
  }

  async overview() {
    const now = Date.now();
    const since24 = new Date(now - DAY);
    const since7 = new Date(now - 7 * DAY);
    const since14 = new Date(now - 13 * DAY);
    since14.setUTCHours(0, 0, 0, 0);

    const [
      usersTotal, usersByStatus, newUsers24, newUsers7, kycPending, ticketsOpen,
      depositsPending, withdrawalsPending, deposits7, withdrawals7,
      trades24, openTrades, volume24, wins24, losses24, signups, recentAudit,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: since24 } } }),
      this.prisma.user.count({ where: { createdAt: { gte: since7 } } }),
      this.prisma.kycRecord.count({ where: { status: 'PENDING' } }),
      this.prisma.supportTicket.count({ where: { status: { not: 'CLOSED' } } }),
      this.prisma.deposit.aggregate({ where: { status: { in: ['PENDING', 'PROCESSING'] } }, _count: { _all: true }, _sum: { amount: true } }),
      this.prisma.withdrawal.aggregate({ where: { status: { in: ['PENDING', 'PROCESSING'] } }, _count: { _all: true }, _sum: { amount: true } }),
      this.prisma.deposit.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: since7 } }, _count: { _all: true }, _sum: { amount: true } }),
      this.prisma.withdrawal.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: since7 } }, _count: { _all: true }, _sum: { amount: true } }),
      this.prisma.engineTrade.count({ where: { entryTime: { gte: since24 } } }),
      this.prisma.engineTrade.count({ where: { status: 'PENDING' } }),
      this.prisma.engineTrade.aggregate({ where: { entryTime: { gte: since24 } }, _sum: { stakeUsd: true } }),
      this.prisma.engineTrade.count({ where: { entryTime: { gte: since24 }, status: 'WON' } }),
      this.prisma.engineTrade.count({ where: { entryTime: { gte: since24 }, status: 'LOST' } }),
      this.prisma.user.findMany({ where: { createdAt: { gte: since14 } }, select: { createdAt: true }, take: 20000 }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { admin: { select: { fullName: true } } },
      }),
    ]);

    const days = Array.from({ length: 14 }, (_, i) => {
      const start = new Date(since14.getTime() + i * DAY);
      return { day: start.toISOString().slice(0, 10), signups: 0 };
    });
    for (const user of signups) {
      const key = user.createdAt.toISOString().slice(0, 10);
      const bucket = days.find((d) => d.day === key);
      if (bucket) bucket.signups += 1;
    }

    return {
      generatedAt: new Date().toISOString(),
      users: {
        total: usersTotal,
        new24h: newUsers24,
        new7d: newUsers7,
        byStatus: Object.fromEntries(usersByStatus.map((row) => [row.status, row._count._all])),
      },
      queues: {
        kycPending,
        ticketsOpen,
        depositsPending: { count: depositsPending._count._all, amount: num(depositsPending._sum.amount) },
        withdrawalsPending: { count: withdrawalsPending._count._all, amount: num(withdrawalsPending._sum.amount) },
      },
      money7d: {
        deposits: { count: deposits7._count._all, amount: num(deposits7._sum.amount) },
        withdrawals: { count: withdrawals7._count._all, amount: num(withdrawals7._sum.amount) },
        currency: 'KES',
      },
      trading24h: {
        trades: trades24,
        openTrades,
        volumeUsd: num(volume24._sum.stakeUsd),
        winRate: wins24 + losses24 ? Math.round((wins24 / (wins24 + losses24)) * 1000) / 10 : null,
      },
      signups14d: days,
      recentActivity: recentAudit.map((log) => ({
        id: log.id,
        action: log.action,
        description: log.description,
        adminName: log.admin?.fullName ?? null,
        createdAt: log.createdAt.toISOString(),
      })),
    };
  }

  async listUsers(query: PageQuery & { search?: string; status?: string; kyc?: string }) {
    const { page, limit, skip } = pageOf(query);
    const search = searchText(query.search);
    const status = oneOf(query.status, USER_STATUSES, 'status');
    const kyc = oneOf(query.kyc, KYC_STATUSES, 'KYC status');
    const where: Prisma.UserWhereInput = {};
    if (status) where.status = status;
    if (kyc) where.kycStatus = kyc;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { id: search },
      ];
    }
    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: { id: true, fullName: true, email: true, phone: true, role: true, status: true, kycStatus: true, createdAt: true },
      }),
    ]);
    return { total, page, limit, pages: Math.ceil(total / limit), items: users };
  }

  async userDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, fullName: true, email: true, phone: true, role: true, status: true, kycStatus: true,
        referralCode: true, createdAt: true, updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found.');
    const [wallets, engineWallets, trades, tradeStats, deposits, withdrawals, kyc, tickets, audit] = await Promise.all([
      this.prisma.wallet.findMany({ where: { userId: id }, select: { currency: true, balance: true, locked: true } }),
      this.prisma.engineWallet.findMany({ where: { userId: id }, select: { accountType: true, currency: true, balance: true, locked: true } }),
      this.prisma.engineTrade.findMany({
        where: { userId: id },
        orderBy: { entryTime: 'desc' },
        take: 10,
        select: { id: true, asset: true, side: true, status: true, accountType: true, stakeUsd: true, profitUsd: true, payoutPercent: true, entryTime: true },
      }),
      this.prisma.engineTrade.groupBy({ by: ['status'], where: { userId: id }, _count: { _all: true }, _sum: { stakeUsd: true, profitUsd: true } }),
      this.prisma.deposit.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, amount: true, currency: true, status: true, externalRef: true, createdAt: true } }),
      this.prisma.withdrawal.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, amount: true, currency: true, status: true, rejectionReason: true, createdAt: true } }),
      this.prisma.kycRecord.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, documentType: true, status: true, rejectionReason: true, createdAt: true, reviewedAt: true } }),
      this.prisma.supportTicket.findMany({ where: { userId: id }, orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, subject: true, status: true, updatedAt: true } }),
      this.prisma.auditLog.findMany({ where: { OR: [{ userId: id }, { targetId: id }] }, orderBy: { createdAt: 'desc' }, take: 10, include: { admin: { select: { fullName: true } } } }),
    ]);
    const totals = tradeStats.reduce(
      (acc, row) => ({
        trades: acc.trades + row._count._all,
        volumeUsd: acc.volumeUsd + num(row._sum.stakeUsd),
        profitUsd: acc.profitUsd + num(row._sum.profitUsd),
        won: acc.won + (row.status === 'WON' ? row._count._all : 0),
        lost: acc.lost + (row.status === 'LOST' ? row._count._all : 0),
      }),
      { trades: 0, volumeUsd: 0, profitUsd: 0, won: 0, lost: 0 },
    );
    return {
      user,
      wallets: wallets.map((w) => ({ currency: w.currency, balance: num(w.balance), locked: num(w.locked) })),
      tradingWallets: engineWallets.map((w) => ({ accountType: w.accountType, currency: w.currency, balance: num(w.balance), locked: num(w.locked) })),
      tradeTotals: totals,
      trades: trades.map((t) => ({ ...t, stakeUsd: num(t.stakeUsd), profitUsd: t.profitUsd === null ? null : num(t.profitUsd), payoutPercent: num(t.payoutPercent) })),
      deposits: deposits.map((d) => ({ ...d, amount: num(d.amount) })),
      withdrawals: withdrawals.map((w) => ({ ...w, amount: num(w.amount) })),
      kyc,
      tickets,
      audit: audit.map((log) => ({ id: log.id, action: log.action, description: log.description, adminName: log.admin?.fullName ?? null, createdAt: log.createdAt })),
    };
  }

  async setUserStatus(admin: AdminIdentity, id: string, body: { status?: string; reason?: string }) {
    const status = oneOf(body?.status, SETTABLE_STATUSES, 'status');
    if (!status) throw new BadRequestException('Choose ACTIVE, SUSPENDED or LOCKED.');
    const reason = reasonText(body?.reason, status !== 'ACTIVE');
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!user) throw new NotFoundException('User not found.');
    if (user.status === 'DELETED') throw new BadRequestException('A deleted account cannot be changed.');
    if (user.status === status) return { success: true, status };
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id }, data: { status } }),
      this.audit(admin, 'USER_STATUS_CHANGED', 'USER', id, `${user.status} → ${status}${reason ? `: ${reason}` : ''}`, { from: user.status, to: status, reason }, id),
    ]);
    return { success: true, status };
  }

  async listKyc(query: PageQuery & { status?: string }) {
    const { page, limit, skip } = pageOf(query);
    const status = oneOf(query.status ?? 'PENDING', KYC_STATUSES, 'KYC status');
    const where: Prisma.KycRecordWhereInput = status ? { status } : {};
    const [total, records] = await Promise.all([
      this.prisma.kycRecord.count({ where }),
      this.prisma.kycRecord.findMany({
        where,
        orderBy: { createdAt: status === 'PENDING' ? 'asc' : 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          reviewedBy: { select: { fullName: true } },
        },
      }),
    ]);
    return {
      total, page, limit, pages: Math.ceil(total / limit),
      items: records.map((r) => ({
        id: r.id,
        user: r.user,
        documentType: r.documentType,
        documentNumber: r.documentNumber,
        images: { front: r.frontImageUrl, back: r.backImageUrl, selfie: r.selfieImageUrl, addressProof: r.addressProofUrl },
        status: r.status,
        rejectionReason: r.rejectionReason,
        reviewedBy: r.reviewedBy?.fullName ?? null,
        reviewedAt: r.reviewedAt,
        createdAt: r.createdAt,
      })),
    };
  }

  async reviewKyc(admin: AdminIdentity, id: string, body: { decision?: string; reason?: string }) {
    const decision = String(body?.decision || '').toUpperCase();
    if (decision !== 'APPROVE' && decision !== 'REJECT') throw new BadRequestException('Decision must be APPROVE or REJECT.');
    const reason = reasonText(body?.reason, decision === 'REJECT');
    const record = await this.prisma.kycRecord.findUnique({ where: { id }, select: { id: true, userId: true, status: true } });
    if (!record) throw new NotFoundException('KYC record not found.');
    if (record.status !== 'PENDING') throw new BadRequestException('This KYC submission has already been reviewed.');
    const status = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await this.prisma.$transaction([
      this.prisma.kycRecord.update({
        where: { id },
        data: { status, rejectionReason: decision === 'REJECT' ? reason : null, reviewedByAdminId: admin.id, reviewedAt: new Date() },
      }),
      this.prisma.user.update({ where: { id: record.userId }, data: { kycStatus: status } }),
      this.audit(admin, decision === 'APPROVE' ? 'KYC_APPROVED' : 'KYC_REJECTED', 'KYC', id, reason ?? 'Documents approved', { reason }, record.userId),
    ]);
    return { success: true, status };
  }

  async listFinance(query: PageQuery & { kind?: string; status?: string; search?: string }) {
    const { page, limit, skip } = pageOf(query);
    const kind = query.kind === 'withdrawals' ? 'withdrawals' : 'deposits';
    const status = oneOf(query.status, MONEY_STATUSES, 'status');
    const search = searchText(query.search);
    const userFilter: Prisma.UserWhereInput | undefined = search
      ? { OR: [{ email: { contains: search, mode: 'insensitive' } }, { fullName: { contains: search, mode: 'insensitive' } }] }
      : undefined;
    const userSelect = { select: { id: true, fullName: true, email: true } } as const;
    const gatewaySelect = { select: { name: true } } as const;

    if (kind === 'deposits') {
      const where: Prisma.DepositWhereInput = { ...(status ? { status } : {}), ...(userFilter ? { user: userFilter } : {}) };
      const [total, rows, sum] = await Promise.all([
        this.prisma.deposit.count({ where }),
        this.prisma.deposit.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: { user: userSelect, gateway: gatewaySelect } }),
        this.prisma.deposit.aggregate({ where, _sum: { amount: true } }),
      ]);
      return {
        kind, total, page, limit, pages: Math.ceil(total / limit), sum: num(sum._sum.amount),
        items: rows.map((r) => ({ id: r.id, user: r.user, gateway: r.gateway.name, amount: num(r.amount), currency: r.currency, phone: r.phone, reference: r.externalRef, status: r.status, note: null as string | null, createdAt: r.createdAt })),
      };
    }
    const where: Prisma.WithdrawalWhereInput = { ...(status ? { status } : {}), ...(userFilter ? { user: userFilter } : {}) };
    const [total, rows, sum] = await Promise.all([
      this.prisma.withdrawal.count({ where }),
      this.prisma.withdrawal.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: { user: userSelect, gateway: gatewaySelect } }),
      this.prisma.withdrawal.aggregate({ where, _sum: { amount: true } }),
    ]);
    return {
      kind, total, page, limit, pages: Math.ceil(total / limit), sum: num(sum._sum.amount),
      items: rows.map((r) => ({ id: r.id, user: r.user, gateway: r.gateway.name, amount: num(r.amount), currency: r.currency, phone: r.phone, reference: r.externalRef, status: r.status, note: r.rejectionReason, createdAt: r.createdAt })),
    };
  }

  async listTickets(query: PageQuery & { status?: string; search?: string }) {
    const { page, limit, skip } = pageOf(query);
    const status = oneOf(query.status, TICKET_STATUSES, 'ticket status');
    const search = searchText(query.search);
    const where: Prisma.SupportTicketWhereInput = {
      ...(status ? { status } : {}),
      ...(search ? { OR: [
        { subject: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
      ] } : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.supportTicket.count({ where }),
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { id: true, fullName: true, email: true } }, _count: { select: { messages: true } } },
      }),
    ]);
    return {
      total, page, limit, pages: Math.ceil(total / limit),
      items: rows.map((t) => ({ id: t.id, subject: t.subject, status: t.status, user: t.user, messages: t._count.messages, createdAt: t.createdAt, updatedAt: t.updatedAt })),
    };
  }

  async ticketDetail(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' }, take: 200, select: { id: true, senderRole: true, message: true, createdAt: true } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found.');
    return ticket;
  }

  async setTicketStatus(admin: AdminIdentity, id: string, body: { status?: string }) {
    const status = oneOf(body?.status, TICKET_STATUSES, 'ticket status');
    if (!status) throw new BadRequestException('Choose a ticket status.');
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id }, select: { id: true, userId: true, status: true } });
    if (!ticket) throw new NotFoundException('Ticket not found.');
    await this.prisma.$transaction([
      this.prisma.supportTicket.update({ where: { id }, data: { status } }),
      this.audit(admin, 'TICKET_STATUS_CHANGED', 'SUPPORT_TICKET', id, `${ticket.status} → ${status}`, { from: ticket.status, to: status }, ticket.userId),
    ]);
    return { success: true, status };
  }

  async listAudit(query: PageQuery & { search?: string }) {
    const { page, limit, skip } = pageOf(query);
    const search = searchText(query.search);
    const where: Prisma.AuditLogWhereInput = search
      ? { OR: [
        { action: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { targetId: search },
      ] }
      : {};
    const [total, rows] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { admin: { select: { fullName: true, role: true } }, user: { select: { fullName: true, email: true } } },
      }),
    ]);
    return {
      total, page, limit, pages: Math.ceil(total / limit),
      items: rows.map((log) => ({
        id: log.id,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        description: log.description,
        admin: log.admin ? { fullName: log.admin.fullName, role: log.admin.role } : null,
        user: log.user ? { fullName: log.user.fullName, email: log.user.email } : null,
        createdAt: log.createdAt,
      })),
    };
  }

  /** Recorded after team changes made through the admin endpoints. */
  logTeamChange(admin: AdminIdentity, action: string, targetId: string, description: string) {
    return this.audit(admin, action, 'ADMIN', targetId, description);
  }
}
