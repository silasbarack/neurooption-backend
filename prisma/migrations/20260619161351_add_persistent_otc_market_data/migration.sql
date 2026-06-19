-- CreateTable
CREATE TABLE "OtcAsset" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "basePrice" DECIMAL(24,10) NOT NULL,
    "precision" INTEGER NOT NULL,
    "payoutBoost" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtcAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtcCandle" (
    "id" TEXT NOT NULL,
    "assetSymbol" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL DEFAULT 'M1',
    "open" DECIMAL(24,10) NOT NULL,
    "high" DECIMAL(24,10) NOT NULL,
    "low" DECIMAL(24,10) NOT NULL,
    "close" DECIMAL(24,10) NOT NULL,
    "openTime" TIMESTAMP(3) NOT NULL,
    "closeTime" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'OTC_SYNTHETIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtcCandle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtcAsset_symbol_key" ON "OtcAsset"("symbol");

-- CreateIndex
CREATE INDEX "OtcAsset_category_idx" ON "OtcAsset"("category");

-- CreateIndex
CREATE INDEX "OtcAsset_isActive_idx" ON "OtcAsset"("isActive");

-- CreateIndex
CREATE INDEX "OtcCandle_assetSymbol_timeframe_openTime_idx" ON "OtcCandle"("assetSymbol", "timeframe", "openTime");

-- CreateIndex
CREATE UNIQUE INDEX "OtcCandle_assetSymbol_timeframe_openTime_key" ON "OtcCandle"("assetSymbol", "timeframe", "openTime");

-- AddForeignKey
ALTER TABLE "OtcCandle" ADD CONSTRAINT "OtcCandle_assetSymbol_fkey" FOREIGN KEY ("assetSymbol") REFERENCES "OtcAsset"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;
