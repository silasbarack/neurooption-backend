-- CreateEnum
CREATE TYPE "LedgerAccountType" AS ENUM ('ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE', 'EQUITY');

-- CreateEnum
CREATE TYPE "LedgerAccountCode" AS ENUM ('USER_REAL_AVAILABLE_LIABILITY', 'USER_OPEN_TRADE_ESCROW', 'USER_WITHDRAWAL_PENDING', 'PLATFORM_CASH_MPESA_CLEARING', 'PLATFORM_CASH_CARD_CLEARING', 'PLATFORM_CASH_BANK_CLEARING', 'PLATFORM_CASH_CRYPTO_CLEARING', 'PLATFORM_TRADING_REVENUE', 'PLATFORM_TRADING_PAYOUT_EXPENSE', 'PAYMENT_PROCESSOR_FEES', 'BONUS_LIABILITY', 'SUSPENSE_ACCOUNT');

-- CreateEnum
CREATE TYPE "LedgerEntrySide" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "LedgerTransactionType" AS ENUM ('DEPOSIT_CONFIRMED', 'WITHDRAWAL_REQUESTED', 'WITHDRAWAL_PAID', 'WITHDRAWAL_REJECTED', 'TRADE_PLACED', 'TRADE_WON', 'TRADE_LOST', 'TRADE_REFUNDED', 'BONUS_GRANTED', 'BONUS_CANCELLED', 'MANUAL_ADJUSTMENT', 'PAYMENT_FEE');

-- CreateTable
CREATE TABLE "LedgerAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "code" "LedgerAccountCode" NOT NULL,
    "type" "LedgerAccountType" NOT NULL,
    "currency" "AccountCurrency" NOT NULL,
    "name" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LedgerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerTransaction" (
    "id" TEXT NOT NULL,
    "type" "LedgerTransactionType" NOT NULL,
    "currency" "AccountCurrency" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "description" TEXT,
    "idempotencyKey" TEXT,
    "userId" TEXT,
    "tradeId" TEXT,
    "depositId" TEXT,
    "withdrawalId" TEXT,
    "externalReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "side" "LedgerEntrySide" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" "AccountCurrency" NOT NULL,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LedgerAccount_userId_idx" ON "LedgerAccount"("userId");

-- CreateIndex
CREATE INDEX "LedgerAccount_code_idx" ON "LedgerAccount"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerAccount_userId_code_currency_key" ON "LedgerAccount"("userId", "code", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerTransaction_idempotencyKey_key" ON "LedgerTransaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "LedgerTransaction_userId_idx" ON "LedgerTransaction"("userId");

-- CreateIndex
CREATE INDEX "LedgerTransaction_tradeId_idx" ON "LedgerTransaction"("tradeId");

-- CreateIndex
CREATE INDEX "LedgerTransaction_depositId_idx" ON "LedgerTransaction"("depositId");

-- CreateIndex
CREATE INDEX "LedgerTransaction_withdrawalId_idx" ON "LedgerTransaction"("withdrawalId");

-- CreateIndex
CREATE INDEX "LedgerTransaction_type_idx" ON "LedgerTransaction"("type");

-- CreateIndex
CREATE INDEX "LedgerTransaction_createdAt_idx" ON "LedgerTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "LedgerEntry_transactionId_idx" ON "LedgerEntry"("transactionId");

-- CreateIndex
CREATE INDEX "LedgerEntry_accountId_idx" ON "LedgerEntry"("accountId");

-- AddForeignKey
ALTER TABLE "LedgerAccount" ADD CONSTRAINT "LedgerAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerTransaction" ADD CONSTRAINT "LedgerTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "LedgerTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LedgerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enforce ledger immutability at the database level, not just in
-- application code: once a LedgerTransaction or LedgerEntry row is
-- inserted, it can never be updated or deleted. Corrections must be
-- posted as new, separate transactions (e.g. a reversing entry).
CREATE OR REPLACE FUNCTION ledger_block_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Ledger rows are immutable: % is not allowed on %', TG_OP, TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ledger_entry_immutable
  BEFORE UPDATE OR DELETE ON "LedgerEntry"
  FOR EACH ROW EXECUTE FUNCTION ledger_block_mutation();

CREATE TRIGGER ledger_transaction_immutable
  BEFORE UPDATE OR DELETE ON "LedgerTransaction"
  FOR EACH ROW EXECUTE FUNCTION ledger_block_mutation();
