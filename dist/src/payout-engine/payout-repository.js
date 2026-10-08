"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoopPayoutRepository = exports.PrismaPayoutRepository = void 0;
exports.createPayoutRepository = createPayoutRepository;
const client_1 = require("@prisma/client");
const LEADER_LOCK_KEY = 732_190_441;
const toNumber = (value) => value === null || value === undefined ? null : Number(value);
function mapState(row) {
    return {
        assetSymbol: row.assetSymbol,
        marketType: row.marketType,
        category: row.category,
        payoutPercent: Number(row.payoutPercent),
        baselinePercent: Number(row.baselinePercent),
        targetPercent: toNumber(row.targetPercent),
        smoothedPercent: toNumber(row.smoothedPercent),
        version: row.version,
        lastChangedAt: new Date(row.lastChangedAt).getTime(),
        lastReviewedAt: new Date(row.lastReviewedAt).getTime(),
    };
}
function mapHistory(row) {
    return {
        assetSymbol: row.assetSymbol,
        version: row.version,
        previousPercent: toNumber(row.previousPercent),
        payoutPercent: Number(row.payoutPercent),
        targetPercent: toNumber(row.targetPercent),
        smoothedPercent: toNumber(row.smoothedPercent),
        reason: row.reason,
        riskMetrics: row.riskMetrics,
        createdAt: new Date(row.createdAt).getTime(),
    };
}
function session(client) {
    return {
        loadStates: async () => (await client.assetPayoutState.findMany()).map(mapState),
        loadChangesSince: async (since) => (await client.assetPayoutHistory.findMany({
            where: { createdAt: { gt: new Date(since) } },
            orderBy: { createdAt: 'asc' },
        })).map(mapHistory),
        insertMissing: async (states) => {
            if (!states.length)
                return;
            await client.assetPayoutState.createMany({
                data: states.map((state) => ({
                    assetSymbol: state.assetSymbol,
                    marketType: state.marketType,
                    category: state.category,
                    payoutPercent: new client_1.Prisma.Decimal(state.payoutPercent),
                    baselinePercent: new client_1.Prisma.Decimal(state.baselinePercent),
                    version: state.version,
                    lastChangedAt: new Date(state.lastChangedAt),
                    lastReviewedAt: new Date(state.lastReviewedAt),
                    reason: state.reason,
                })),
                skipDuplicates: true,
            });
        },
        publishChange: async (change) => {
            const { count } = await client.assetPayoutState.updateMany({
                where: { assetSymbol: change.assetSymbol, version: change.expectedVersion },
                data: {
                    payoutPercent: new client_1.Prisma.Decimal(change.payoutPercent),
                    targetPercent: change.targetPercent === null ? null : new client_1.Prisma.Decimal(change.targetPercent),
                    smoothedPercent: change.smoothedPercent === null ? null : new client_1.Prisma.Decimal(change.smoothedPercent),
                    version: { increment: 1 },
                    lastChangedAt: new Date(change.changedAt),
                    lastReviewedAt: new Date(change.changedAt),
                    lastEvaluatedAt: new Date(change.changedAt),
                    riskMetrics: change.riskMetrics,
                    reason: change.reason,
                },
            });
            if (count !== 1)
                return false;
            await client.assetPayoutHistory.create({
                data: {
                    assetSymbol: change.assetSymbol,
                    version: change.expectedVersion + 1,
                    previousPercent: new client_1.Prisma.Decimal(change.previousPercent),
                    payoutPercent: new client_1.Prisma.Decimal(change.payoutPercent),
                    targetPercent: change.targetPercent === null ? null : new client_1.Prisma.Decimal(change.targetPercent),
                    smoothedPercent: change.smoothedPercent === null ? null : new client_1.Prisma.Decimal(change.smoothedPercent),
                    reason: change.reason,
                    riskMetrics: change.riskMetrics,
                    config: change.config,
                    createdAt: new Date(change.changedAt),
                },
            });
            return true;
        },
        saveEvaluations: async (evaluations, evaluatedAt) => {
            if (!evaluations.length)
                return;
            const symbols = evaluations.map((item) => item.assetSymbol);
            const targets = evaluations.map((item) => item.targetPercent);
            const smoothed = evaluations.map((item) => item.smoothedPercent);
            const reviewed = evaluations.map((item) => new Date(item.lastReviewedAt).toISOString());
            const metrics = evaluations.map((item) => JSON.stringify(item.riskMetrics ?? null));
            await client.$executeRaw `
        UPDATE "AssetPayoutState" AS s
        SET "targetPercent" = v.target,
            "smoothedPercent" = v.smoothed,
            "lastReviewedAt" = GREATEST(s."lastReviewedAt", v.reviewed),
            "riskMetrics" = v.metrics,
            "lastEvaluatedAt" = ${new Date(evaluatedAt)},
            "updatedAt" = ${new Date(evaluatedAt)}
        FROM (
          SELECT
            unnest(${symbols}::text[]) AS symbol,
            unnest(${targets}::numeric[]) AS target,
            unnest(${smoothed}::numeric[]) AS smoothed,
            unnest(${reviewed}::timestamptz[]) AT TIME ZONE 'UTC' AS reviewed,
            unnest(${metrics}::text[])::jsonb AS metrics
        ) AS v
        WHERE s."assetSymbol" = v.symbol`;
        },
    };
}
class PrismaPayoutRepository {
    constructor(prisma) {
        this.prisma = prisma;
        this.enabled = true;
    }
    loadStates() {
        return session(this.prisma).loadStates();
    }
    loadChangesSince(since) {
        return session(this.prisma).loadChangesSince(since);
    }
    async loadHistory(assetSymbol, limit) {
        const rows = await this.prisma.assetPayoutHistory.findMany({
            where: { assetSymbol },
            orderBy: { version: 'desc' },
            take: limit,
        });
        return rows.map(mapHistory);
    }
    async withLeaderLock(fn) {
        return this.prisma.$transaction(async (tx) => {
            const [row] = await tx.$queryRaw `
          SELECT pg_try_advisory_xact_lock(${LEADER_LOCK_KEY}::bigint) AS locked`;
            if (!row?.locked)
                return null;
            return fn(session(tx));
        }, { timeout: 15_000, maxWait: 5_000 });
    }
    close() {
        return this.prisma.$disconnect();
    }
}
exports.PrismaPayoutRepository = PrismaPayoutRepository;
class NoopPayoutRepository {
    constructor() {
        this.enabled = false;
    }
    async loadStates() {
        return [];
    }
    async loadChangesSince() {
        return [];
    }
    async loadHistory() {
        return [];
    }
    async withLeaderLock() {
        return null;
    }
    async close() {
        return undefined;
    }
}
exports.NoopPayoutRepository = NoopPayoutRepository;
function createPayoutRepository() {
    const url = process.env.DATABASE_URL?.trim();
    if (!url)
        return new NoopPayoutRepository();
    const separator = url.includes('?') ? '&' : '?';
    const datasourceUrl = /[?&]connection_limit=/.test(url)
        ? url
        : `${url}${separator}connection_limit=2`;
    return new PrismaPayoutRepository(new client_1.PrismaClient({ datasourceUrl }));
}
//# sourceMappingURL=payout-repository.js.map