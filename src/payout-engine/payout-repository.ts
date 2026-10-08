import {
  AssetPayoutHistory,
  AssetPayoutState,
  Prisma,
  PrismaClient,
} from '@prisma/client';

/**
 * Persistence for the payout engine. Optional: with no DATABASE_URL (the
 * market-only mode) the engine runs from memory alone.
 *
 * Several backend instances may run at once. Only the instance holding a
 * transaction-scoped Postgres advisory lock writes payout changes in a given
 * evaluation; the others read the published state. Every change is also a
 * compare-and-set on the row's version, and history rows are unique on
 * (asset, version), so a payout version can never be published twice.
 */

/** Arbitrary constant naming the payout-engine leader lock. */
const LEADER_LOCK_KEY = 732_190_441;

export type StoredPayoutState = {
  assetSymbol: string;
  marketType: string;
  category: string;
  payoutPercent: number;
  baselinePercent: number;
  targetPercent: number | null;
  smoothedPercent: number | null;
  version: number;
  lastChangedAt: number;
  lastReviewedAt: number;
};

export type PayoutHistoryEntry = {
  assetSymbol: string;
  version: number;
  previousPercent: number | null;
  payoutPercent: number;
  targetPercent: number | null;
  smoothedPercent: number | null;
  reason: string;
  riskMetrics: unknown;
  createdAt: number;
};

export type NewPayoutState = Omit<StoredPayoutState, 'targetPercent' | 'smoothedPercent'> & {
  reason: string;
};

export type PayoutChangeWrite = {
  assetSymbol: string;
  expectedVersion: number;
  previousPercent: number;
  payoutPercent: number;
  targetPercent: number | null;
  smoothedPercent: number | null;
  changedAt: number;
  reason: string;
  riskMetrics: unknown;
  config: unknown;
};

export type EvaluationWrite = {
  assetSymbol: string;
  targetPercent: number | null;
  smoothedPercent: number | null;
  lastReviewedAt: number;
  riskMetrics: unknown;
};

/** The writes a leader may make while it holds the lock. */
export type LeaderSession = {
  loadStates(): Promise<StoredPayoutState[]>;
  loadChangesSince(since: number): Promise<PayoutHistoryEntry[]>;
  insertMissing(states: NewPayoutState[]): Promise<void>;
  /** Compare-and-set; false when another writer got there first. */
  publishChange(change: PayoutChangeWrite): Promise<boolean>;
  saveEvaluations(evaluations: EvaluationWrite[], evaluatedAt: number): Promise<void>;
};

export interface PayoutRepository {
  readonly enabled: boolean;
  loadStates(): Promise<StoredPayoutState[]>;
  loadChangesSince(since: number): Promise<PayoutHistoryEntry[]>;
  loadHistory(assetSymbol: string, limit: number): Promise<PayoutHistoryEntry[]>;
  /** Runs fn as leader; resolves to null when another instance leads. */
  withLeaderLock<T>(fn: (session: LeaderSession) => Promise<T>): Promise<T | null>;
  close(): Promise<void>;
}

const toNumber = (value: Prisma.Decimal | number | null | undefined) =>
  value === null || value === undefined ? null : Number(value);

function mapState(row: AssetPayoutState): StoredPayoutState {
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

function mapHistory(row: AssetPayoutHistory): PayoutHistoryEntry {
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

type Client = PrismaClient | Prisma.TransactionClient;

function session(client: Client): LeaderSession {
  return {
    loadStates: async () => (await client.assetPayoutState.findMany()).map(mapState),
    loadChangesSince: async (since) =>
      (
        await client.assetPayoutHistory.findMany({
          where: { createdAt: { gt: new Date(since) } },
          orderBy: { createdAt: 'asc' },
        })
      ).map(mapHistory),
    insertMissing: async (states) => {
      if (!states.length) return;
      await client.assetPayoutState.createMany({
        data: states.map((state) => ({
          assetSymbol: state.assetSymbol,
          marketType: state.marketType,
          category: state.category,
          payoutPercent: new Prisma.Decimal(state.payoutPercent),
          baselinePercent: new Prisma.Decimal(state.baselinePercent),
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
          payoutPercent: new Prisma.Decimal(change.payoutPercent),
          targetPercent:
            change.targetPercent === null ? null : new Prisma.Decimal(change.targetPercent),
          smoothedPercent:
            change.smoothedPercent === null ? null : new Prisma.Decimal(change.smoothedPercent),
          version: { increment: 1 },
          lastChangedAt: new Date(change.changedAt),
          lastReviewedAt: new Date(change.changedAt),
          lastEvaluatedAt: new Date(change.changedAt),
          riskMetrics: change.riskMetrics as Prisma.InputJsonValue,
          reason: change.reason,
        },
      });
      if (count !== 1) return false;
      await client.assetPayoutHistory.create({
        data: {
          assetSymbol: change.assetSymbol,
          version: change.expectedVersion + 1,
          previousPercent: new Prisma.Decimal(change.previousPercent),
          payoutPercent: new Prisma.Decimal(change.payoutPercent),
          targetPercent:
            change.targetPercent === null ? null : new Prisma.Decimal(change.targetPercent),
          smoothedPercent:
            change.smoothedPercent === null ? null : new Prisma.Decimal(change.smoothedPercent),
          reason: change.reason,
          riskMetrics: change.riskMetrics as Prisma.InputJsonValue,
          config: change.config as Prisma.InputJsonValue,
          createdAt: new Date(change.changedAt),
        },
      });
      return true;
    },
    saveEvaluations: async (evaluations, evaluatedAt) => {
      if (!evaluations.length) return;
      // One statement for every asset rather than one update each.
      const symbols = evaluations.map((item) => item.assetSymbol);
      const targets = evaluations.map((item) => item.targetPercent);
      const smoothed = evaluations.map((item) => item.smoothedPercent);
      const reviewed = evaluations.map((item) => new Date(item.lastReviewedAt).toISOString());
      const metrics = evaluations.map((item) => JSON.stringify(item.riskMetrics ?? null));
      await client.$executeRaw`
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

export class PrismaPayoutRepository implements PayoutRepository {
  readonly enabled = true;

  constructor(private readonly prisma: PrismaClient) {}

  loadStates() {
    return session(this.prisma).loadStates();
  }

  loadChangesSince(since: number) {
    return session(this.prisma).loadChangesSince(since);
  }

  async loadHistory(assetSymbol: string, limit: number) {
    const rows = await this.prisma.assetPayoutHistory.findMany({
      where: { assetSymbol },
      orderBy: { version: 'desc' },
      take: limit,
    });
    return rows.map(mapHistory);
  }

  async withLeaderLock<T>(fn: (leader: LeaderSession) => Promise<T>): Promise<T | null> {
    return this.prisma.$transaction(
      async (tx) => {
        const [row] = await tx.$queryRaw<Array<{ locked: boolean }>>`
          SELECT pg_try_advisory_xact_lock(${LEADER_LOCK_KEY}::bigint) AS locked`;
        if (!row?.locked) return null;
        return fn(session(tx));
      },
      { timeout: 15_000, maxWait: 5_000 },
    );
  }

  close() {
    return this.prisma.$disconnect();
  }
}

/** Memory-only stand-in used when no database is configured. */
export class NoopPayoutRepository implements PayoutRepository {
  readonly enabled = false;
  async loadStates() {
    return [];
  }
  async loadChangesSince() {
    return [];
  }
  async loadHistory() {
    return [];
  }
  async withLeaderLock<T>(): Promise<T | null> {
    return null;
  }
  async close() {
    return undefined;
  }
}

/** A small dedicated pool: the engine makes a few queries a minute. */
export function createPayoutRepository(): PayoutRepository {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return new NoopPayoutRepository();
  const separator = url.includes('?') ? '&' : '?';
  const datasourceUrl = /[?&]connection_limit=/.test(url)
    ? url
    : `${url}${separator}connection_limit=2`;
  return new PrismaPayoutRepository(new PrismaClient({ datasourceUrl }));
}
