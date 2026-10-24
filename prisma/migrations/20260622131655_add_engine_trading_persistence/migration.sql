-- CreateTable
CREATE TABLE "EngineWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'QT Demo',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "balance" DECIMAL(30,10) NOT NULL DEFAULT 0,
    "balanceUsd" DECIMAL(30,10) NOT NULL DEFAULT 0,
    "locked" DECIMAL(30,10) NOT NULL DEFAULT 0,
    "lockedUsd" DECIMAL(30,10) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngineWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngineTrade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT,
    "asset" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL DEFAULT 'M1',
    "side" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "accountType" TEXT NOT NULL DEFAULT 'QT Demo',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stakeAmount" DECIMAL(30,10) NOT NULL,
    "stakeUsd" DECIMAL(30,10) NOT NULL,
    "payoutPercent" DECIMAL(10,4) NOT NULL,
    "expectedProfitAmount" DECIMAL(30,10) NOT NULL,
    "expectedProfitUsd" DECIMAL(30,10) NOT NULL,
    "expectedReturnAmount" DECIMAL(30,10) NOT NULL,
    "expectedReturnUsd" DECIMAL(30,10) NOT NULL,
    "entryPrice" DECIMAL(30,10) NOT NULL,
    "closePrice" DECIMAL(30,10),
    "entryTime" TIMESTAMP(3) NOT NULL,
    "expiryTime" TIMESTAMP(3) NOT NULL,
    "expirySeconds" INTEGER NOT NULL,
    "settledAt" TIMESTAMP(3),
    "resultAmount" DECIMAL(30,10),
    "resultUsd" DECIMAL(30,10),
    "profitAmount" DECIMAL(30,10),
    "profitUsd" DECIMAL(30,10),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngineTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngineTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT,
    "tradeId" TEXT,
    "accountType" TEXT NOT NULL DEFAULT 'QT Demo',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "amount" DECIMAL(30,10) NOT NULL,
    "amountUsd" DECIMAL(30,10) NOT NULL,
    "balanceAfter" DECIMAL(30,10),
    "balanceAfterUsd" DECIMAL(30,10),
    "description" TEXT,
    "reference" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngineTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EngineWallet_userId_idx" ON "EngineWallet"("userId");

-- CreateIndex
CREATE INDEX "EngineWallet_accountType_currency_idx" ON "EngineWallet"("accountType", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "EngineWallet_userId_accountType_currency_key" ON "EngineWallet"("userId", "accountType", "currency");

-- CreateIndex
CREATE INDEX "EngineTrade_userId_status_idx" ON "EngineTrade"("userId", "status");

-- CreateIndex
CREATE INDEX "EngineTrade_asset_timeframe_idx" ON "EngineTrade"("asset", "timeframe");

-- CreateIndex
CREATE INDEX "EngineTrade_expiryTime_idx" ON "EngineTrade"("expiryTime");

-- CreateIndex
CREATE INDEX "EngineTrade_createdAt_idx" ON "EngineTrade"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EngineTransaction_reference_key" ON "EngineTransaction"("reference");

-- CreateIndex
CREATE INDEX "EngineTransaction_userId_idx" ON "EngineTransaction"("userId");

-- CreateIndex
CREATE INDEX "EngineTransaction_walletId_idx" ON "EngineTransaction"("walletId");

-- CreateIndex
CREATE INDEX "EngineTransaction_tradeId_idx" ON "EngineTransaction"("tradeId");

-- CreateIndex
CREATE INDEX "EngineTransaction_type_status_idx" ON "EngineTransaction"("type", "status");

-- CreateIndex
CREATE INDEX "EngineTransaction_createdAt_idx" ON "EngineTransaction"("createdAt");
