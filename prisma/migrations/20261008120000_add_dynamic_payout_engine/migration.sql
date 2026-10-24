-- Dynamic payout engine. Additive only: two new tables and one nullable
-- column; no existing data is changed.

-- AlterTable
ALTER TABLE "EngineTrade" ADD COLUMN "payoutVersion" INTEGER;

-- CreateTable
CREATE TABLE "AssetPayoutState" (
    "assetSymbol" TEXT NOT NULL,
    "marketType" TEXT NOT NULL DEFAULT 'OTC',
    "category" TEXT NOT NULL,
    "payoutPercent" DECIMAL(6,2) NOT NULL,
    "baselinePercent" DECIMAL(6,2) NOT NULL,
    "targetPercent" DECIMAL(8,4),
    "smoothedPercent" DECIMAL(8,4),
    "version" INTEGER NOT NULL DEFAULT 1,
    "lastChangedAt" TIMESTAMP(3) NOT NULL,
    "lastReviewedAt" TIMESTAMP(3) NOT NULL,
    "lastEvaluatedAt" TIMESTAMP(3),
    "riskMetrics" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetPayoutState_pkey" PRIMARY KEY ("assetSymbol")
);

-- CreateTable
CREATE TABLE "AssetPayoutHistory" (
    "id" TEXT NOT NULL,
    "assetSymbol" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "previousPercent" DECIMAL(6,2),
    "payoutPercent" DECIMAL(6,2) NOT NULL,
    "targetPercent" DECIMAL(8,4),
    "smoothedPercent" DECIMAL(8,4),
    "reason" TEXT NOT NULL,
    "riskMetrics" JSONB,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetPayoutHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssetPayoutHistory_assetSymbol_createdAt_idx" ON "AssetPayoutHistory"("assetSymbol", "createdAt");

-- CreateIndex
CREATE INDEX "AssetPayoutHistory_createdAt_idx" ON "AssetPayoutHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AssetPayoutHistory_assetSymbol_version_key" ON "AssetPayoutHistory"("assetSymbol", "version");
