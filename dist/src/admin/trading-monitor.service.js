"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingMonitorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
const STATUS_OPTIONS = ['PENDING', 'WON', 'LOST', 'DRAW'];
const HOUR = 60 * 60 * 1000;
let TradingMonitorService = class TradingMonitorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async overview(query) {
        const account = query.account || 'all';
        const status = (query.status || 'all').toUpperCase();
        const search = (query.search || '').trim();
        if (!['all', 'demo', 'real'].includes(account))
            throw new common_1.BadRequestException('Invalid account filter.');
        if (status !== 'ALL' && !STATUS_OPTIONS.includes(status)) {
            throw new common_1.BadRequestException('Invalid trade status filter.');
        }
        if (search.length > 80)
            throw new common_1.BadRequestException('Search is too long.');
        const page = Number(query.page || '1');
        const limit = Number(query.limit || '20');
        if (!Number.isInteger(page) || page < 1 || page > 100000 ||
            !Number.isInteger(limit) || limit < 1 || limit > 50) {
            throw new common_1.BadRequestException('Invalid pagination.');
        }
        const accountWhere = account === 'all' ? {} : { accountType: account === 'demo' ? 'QT Demo' : 'QT Real' };
        const tableWhere = { ...accountWhere };
        if (status !== 'ALL')
            tableWhere.status = status;
        if (search) {
            const matchedUsers = await this.prisma.user.findMany({
                where: { OR: [
                        { email: { contains: search, mode: 'insensitive' } },
                        { fullName: { contains: search, mode: 'insensitive' } },
                    ] },
                select: { id: true },
                take: 100,
            });
            tableWhere.OR = [
                { asset: { contains: search, mode: 'insensitive' } },
                { id: { contains: search, mode: 'insensitive' } },
                { userId: { in: matchedUsers.map(u => u.id) } },
            ];
        }
        const since = new Date(Date.now() - 24 * HOUR);
        const dayWhere = { ...accountWhere, entryTime: { gte: since } };
        const [total, records, trades24, openTrades, wins24, losses24, volume24, activeUsers, recentSample] = await Promise.all([
            this.prisma.engineTrade.count({ where: tableWhere }),
            this.prisma.engineTrade.findMany({
                where: tableWhere,
                orderBy: [{ entryTime: 'desc' }, { id: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.engineTrade.count({ where: dayWhere }),
            this.prisma.engineTrade.count({ where: { ...accountWhere, status: 'PENDING' } }),
            this.prisma.engineTrade.count({ where: { ...dayWhere, status: 'WON' } }),
            this.prisma.engineTrade.count({ where: { ...dayWhere, status: 'LOST' } }),
            this.prisma.engineTrade.aggregate({ where: dayWhere, _sum: { stakeUsd: true } }),
            this.prisma.engineTrade.groupBy({ by: ['userId'], where: dayWhere }),
            this.prisma.engineTrade.findMany({
                where: dayWhere,
                select: { entryTime: true, stakeUsd: true },
                orderBy: { entryTime: 'desc' },
                take: 2500,
            }),
        ]);
        const ids = [...new Set(records.map(r => r.userId))].filter(id => id !== 'demo-user');
        const clients = ids.length
            ? await this.prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, fullName: true, email: true } })
            : [];
        const clientMap = new Map(clients.map(u => [u.id, u]));
        const buckets = Array.from({ length: 12 }, (_, i) => ({
            start: Math.floor((Date.now() - (11 - i) * 2 * HOUR) / (2 * HOUR)) * 2 * HOUR,
            count: 0,
            volumeUsd: 0,
        }));
        for (const trade of recentSample) {
            const key = Math.floor(trade.entryTime.getTime() / (2 * HOUR)) * 2 * HOUR;
            const bucket = buckets.find(item => item.start === key);
            if (bucket) {
                bucket.count += 1;
                bucket.volumeUsd += Number(trade.stakeUsd);
            }
        }
        return {
            generatedAt: new Date().toISOString(),
            period: 'rolling-24h',
            account,
            stats: {
                trades24,
                openTrades,
                volumeUsd24: Number(volume24._sum.stakeUsd || 0),
                wins24,
                losses24,
                winRate24: wins24 + losses24 ? Math.round((wins24 / (wins24 + losses24)) * 1000) / 10 : null,
                activeClients24: activeUsers.length,
            },
            activity: buckets.map(b => ({ hour: new Date(b.start).toISOString(), trades: b.count, volumeUsd: b.volumeUsd })),
            activitySampled: trades24 > recentSample.length,
            trades: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                items: records.map(t => ({
                    id: t.id,
                    userId: t.userId,
                    clientName: t.userId === 'demo-user' ? 'Shared guest demo' : clientMap.get(t.userId)?.fullName || 'Unknown client',
                    clientEmail: clientMap.get(t.userId)?.email || null,
                    asset: t.asset,
                    side: t.side,
                    status: t.status,
                    accountType: t.accountType,
                    currency: t.currency,
                    stakeAmount: Number(t.stakeAmount),
                    stakeUsd: Number(t.stakeUsd),
                    payoutPercent: Number(t.payoutPercent),
                    profitUsd: t.profitUsd === null ? null : Number(t.profitUsd),
                    entryTime: t.entryTime.toISOString(),
                    expiryTime: t.expiryTime.toISOString(),
                })),
            },
        };
    }
};
exports.TradingMonitorService = TradingMonitorService;
exports.TradingMonitorService = TradingMonitorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TradingMonitorService);
//# sourceMappingURL=trading-monitor.service.js.map