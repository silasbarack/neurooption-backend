/*
  Warnings:

  - The primary key for the `SupportTicket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assetId,timeframeId,type,time]` on the table `Candle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referralCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `targetType` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeframeId` to the `Candle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'KYC_ADMIN', 'RISK_ADMIN', 'COMPLIANCE_ADMIN');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('DEMO', 'REAL');

-- CreateEnum
CREATE TYPE "AccountCurrency" AS ENUM ('KES', 'USD', 'TZS', 'UGX', 'AUD', 'CAD', 'JPY', 'CNY', 'NGN', 'EUR', 'RWD', 'INR', 'AOA', 'ARS');

-- CreateEnum
CREATE TYPE "CandleType" AS ENUM ('CANDLESTICK', 'HEIKEN_ASHI', 'BAR', 'LINE');

-- CreateEnum
CREATE TYPE "ChartType" AS ENUM ('CANDLESTICK', 'HEIKEN_ASHI', 'BAR', 'LINE');

-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('SMA', 'EMA', 'WMA', 'RSI', 'MACD', 'BOLLINGER_BANDS', 'STOCHASTIC', 'ATR', 'ADX', 'CCI', 'MOMENTUM', 'ROC', 'WILLIAMS_R', 'PARABOLIC_SAR', 'ICHIMOKU', 'VWAP', 'OBV', 'MFI', 'PIVOT_POINTS', 'SUPERTREND', 'DONCHIAN_CHANNEL', 'KELTNER_CHANNEL', 'STANDARD_DEVIATION', 'ZIGZAG', 'DEMA', 'TEMA', 'TRIX', 'AROON', 'CHAIKIN_OSCILLATOR', 'VOLUME_OSCILLATOR', 'ALLIGATOR', 'FRACTALS', 'AWESOME_OSCILLATOR', 'ACCELERATOR_OSCILLATOR', 'ENVELOPES', 'GATOR_OSCILLATOR', 'DEMARKER', 'RVI', 'ELDER_RAY', 'FORCE_INDEX', 'BULLS_POWER', 'BEARS_POWER');

-- CreateEnum
CREATE TYPE "PaymentGatewayType" AS ENUM ('MPESA', 'AIRTEL_MONEY', 'TKASH', 'EQUITEL', 'BINANCE_PAY', 'MANUAL');

-- CreateEnum
CREATE TYPE "PaymentDirection" AS ENUM ('IN', 'OUT', 'BOTH');

-- CreateEnum
CREATE TYPE "WebsocketEventType" AS ENUM ('CONNECTED', 'PRICE_UPDATE', 'CANDLE_UPDATE', 'CHART_UPDATE', 'TRADE_OPENED', 'TRADE_SETTLED', 'WALLET_UPDATE', 'DEPOSIT_UPDATE', 'WITHDRAWAL_UPDATE', 'PAYOUT_UPDATE', 'COPY_TRADE_UPDATE');

-- CreateEnum
CREATE TYPE "AffiliateStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SocialFollowStatus" AS ENUM ('ACTIVE', 'PAUSED', 'STOPPED');

-- CreateEnum
CREATE TYPE "CopyTradeStatus" AS ENUM ('OPEN', 'WON', 'LOST', 'DRAW', 'CANCELLED');

-- AlterEnum
ALTER TYPE "NotificationChannel" ADD VALUE 'SMS';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'TRADE_OPENED';
ALTER TYPE "NotificationType" ADD VALUE 'TRADE_CLOSED';
ALTER TYPE "NotificationType" ADD VALUE 'AFFILIATE_COMMISSION_EARNED';
ALTER TYPE "NotificationType" ADD VALUE 'COPY_TRADE_OPENED';
ALTER TYPE "NotificationType" ADD VALUE 'COPY_TRADE_CLOSED';
ALTER TYPE "NotificationType" ADD VALUE 'ADMIN_ACTION';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'AFFILIATE_COMMISSION';
ALTER TYPE "TransactionType" ADD VALUE 'COPY_TRADING_FEE';

-- DropForeignKey
ALTER TABLE "SupportMessage" DROP CONSTRAINT "SupportMessage_ticketId_fkey";

-- DropIndex
DROP INDEX "Candle_assetId_time_key";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "targetId" TEXT,
ADD COLUMN     "targetType" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "Candle" ADD COLUMN     "timeframeId" TEXT NOT NULL,
ADD COLUMN     "type" "CandleType" NOT NULL DEFAULT 'CANDLESTICK';

-- AlterTable
ALTER TABLE "KycRecord" ADD COLUMN     "addressProofUrl" TEXT,
ADD COLUMN     "backImageUrl" TEXT,
ADD COLUMN     "frontImageUrl" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedByAdminId" TEXT,
ADD COLUMN     "selfieImageUrl" TEXT;

-- AlterTable
ALTER TABLE "SupportMessage" ALTER COLUMN "ticketId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "SupportTicket" DROP CONSTRAINT "SupportTicket_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "expiryId" TEXT,
ADD COLUMN     "tradingAccountId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fullName",
ADD COLUMN     "fullname" TEXT NOT NULL,
ADD COLUMN     "passwordResetExpiresAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredById" TEXT;

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "currency" "AccountCurrency" NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "locked" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentGateway" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PaymentGatewayType" NOT NULL,
    "direction" "PaymentDirection" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "publicKey" TEXT,
    "secretKey" TEXT,
    "callbackUrl" TEXT,
    "accountNumber" TEXT,
    "shortcode" TEXT,
    "paybill" TEXT,
    "tillNumber" TEXT,
    "merchantId" TEXT,
    "environment" TEXT NOT NULL DEFAULT 'sandbox',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentGateway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "phone" TEXT,
    "accountNumber" TEXT,
    "checkoutId" TEXT,
    "externalRef" TEXT,
    "gatewayRaw" JSONB,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "phone" TEXT,
    "accountNumber" TEXT,
    "externalRef" TEXT,
    "gatewayRaw" JSONB,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "gatewayId" TEXT,
    "transactionId" TEXT NOT NULL,
    "tradeId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketData" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "marketType" "MarketType" NOT NULL,
    "bid" DECIMAL(65,30) NOT NULL,
    "ask" DECIMAL(65,30) NOT NULL,
    "mid" DECIMAL(65,30) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtcMarket" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtcMarket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealMarket" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealMarket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timeframe" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timeframe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expiry" (
    "id" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChartView" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "timeframeId" TEXT NOT NULL,
    "chartType" "ChartType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChartView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicatorSetting" (
    "id" TEXT NOT NULL,
    "indicator" "IndicatorType" NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "defaultPeriod" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndicatorSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicatorResult" (
    "id" TEXT NOT NULL,
    "settingId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "timeframeId" TEXT NOT NULL,
    "indicator" "IndicatorType" NOT NULL,
    "period" INTEGER,
    "values" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndicatorResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affiliate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "AffiliateStatus" NOT NULL DEFAULT 'ACTIVE',
    "commissionRate" DECIMAL(65,30) NOT NULL DEFAULT 0.10,
    "totalEarned" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Affiliate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateCommission" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "affiliateUserId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "AffiliateCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialFollow" (
    "id" TEXT NOT NULL,
    "followerUserId" TEXT NOT NULL,
    "traderUserId" TEXT NOT NULL,
    "status" "SocialFollowStatus" NOT NULL DEFAULT 'ACTIVE',
    "copyPercentage" DECIMAL(65,30) NOT NULL DEFAULT 1.00,
    "maxStakeAmount" DECIMAL(65,30),
    "minStakeAmount" DECIMAL(65,30),
    "copiedTrades" INTEGER NOT NULL DEFAULT 0,
    "totalProfit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalLoss" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopyTrade" (
    "id" TEXT NOT NULL,
    "socialFollowId" TEXT NOT NULL,
    "masterUserId" TEXT NOT NULL,
    "followerUserId" TEXT NOT NULL,
    "masterTradeId" TEXT NOT NULL,
    "followerTradeId" TEXT,
    "status" "CopyTradeStatus" NOT NULL DEFAULT 'OPEN',
    "stakeAmount" DECIMAL(65,30) NOT NULL,
    "payoutRate" DECIMAL(65,30) NOT NULL,
    "entryPrice" DECIMAL(65,30) NOT NULL,
    "exitPrice" DECIMAL(65,30),
    "profitAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "CopyTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsocketEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "event" "WebsocketEventType" NOT NULL,
    "room" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsocketEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "TradingAccount_userId_type_idx" ON "TradingAccount"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "TradingAccount_userId_type_currency_key" ON "TradingAccount"("userId", "type", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentGateway_type_direction_key" ON "PaymentGateway"("type", "direction");

-- CreateIndex
CREATE UNIQUE INDEX "Deposit_transactionId_key" ON "Deposit"("transactionId");

-- CreateIndex
CREATE INDEX "Deposit_userId_status_idx" ON "Deposit"("userId", "status");

-- CreateIndex
CREATE INDEX "Deposit_gatewayId_status_idx" ON "Deposit"("gatewayId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Withdrawal_transactionId_key" ON "Withdrawal"("transactionId");

-- CreateIndex
CREATE INDEX "Withdrawal_userId_status_idx" ON "Withdrawal"("userId", "status");

-- CreateIndex
CREATE INDEX "Withdrawal_gatewayId_status_idx" ON "Withdrawal"("gatewayId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_transactionId_key" ON "Payout"("transactionId");

-- CreateIndex
CREATE INDEX "Payout_userId_status_idx" ON "Payout"("userId", "status");

-- CreateIndex
CREATE INDEX "Payout_tradeId_idx" ON "Payout"("tradeId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "MarketData_symbol_marketType_timestamp_idx" ON "MarketData"("symbol", "marketType", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "OtcMarket_symbol_key" ON "OtcMarket"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "RealMarket_symbol_key" ON "RealMarket"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "Timeframe_code_key" ON "Timeframe"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Expiry_duration_key" ON "Expiry"("duration");

-- CreateIndex
CREATE UNIQUE INDEX "ChartView_assetId_timeframeId_chartType_key" ON "ChartView"("assetId", "timeframeId", "chartType");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorSetting_indicator_key" ON "IndicatorSetting"("indicator");

-- CreateIndex
CREATE INDEX "IndicatorResult_assetId_timeframeId_indicator_generatedAt_idx" ON "IndicatorResult"("assetId", "timeframeId", "indicator", "generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Affiliate_userId_key" ON "Affiliate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Affiliate_code_key" ON "Affiliate"("code");

-- CreateIndex
CREATE INDEX "AffiliateCommission_affiliateId_status_idx" ON "AffiliateCommission"("affiliateId", "status");

-- CreateIndex
CREATE INDEX "AffiliateCommission_affiliateUserId_idx" ON "AffiliateCommission"("affiliateUserId");

-- CreateIndex
CREATE INDEX "AffiliateCommission_referredUserId_idx" ON "AffiliateCommission"("referredUserId");

-- CreateIndex
CREATE INDEX "SocialFollow_traderUserId_status_idx" ON "SocialFollow"("traderUserId", "status");

-- CreateIndex
CREATE INDEX "SocialFollow_followerUserId_status_idx" ON "SocialFollow"("followerUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SocialFollow_followerUserId_traderUserId_key" ON "SocialFollow"("followerUserId", "traderUserId");

-- CreateIndex
CREATE INDEX "CopyTrade_masterUserId_idx" ON "CopyTrade"("masterUserId");

-- CreateIndex
CREATE INDEX "CopyTrade_followerUserId_idx" ON "CopyTrade"("followerUserId");

-- CreateIndex
CREATE INDEX "CopyTrade_masterTradeId_idx" ON "CopyTrade"("masterTradeId");

-- CreateIndex
CREATE INDEX "CopyTrade_status_idx" ON "CopyTrade"("status");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Candle_assetId_timeframeId_time_idx" ON "Candle"("assetId", "timeframeId", "time");

-- CreateIndex
CREATE UNIQUE INDEX "Candle_assetId_timeframeId_type_time_key" ON "Candle"("assetId", "timeframeId", "type", "time");

-- CreateIndex
CREATE INDEX "Trade_userId_status_idx" ON "Trade"("userId", "status");

-- CreateIndex
CREATE INDEX "Trade_tradingAccountId_idx" ON "Trade"("tradingAccountId");

-- CreateIndex
CREATE INDEX "Trade_assetId_openedAt_idx" ON "Trade"("assetId", "openedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingAccount" ADD CONSTRAINT "TradingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "PaymentGateway"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "PaymentGateway"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "PaymentGateway"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketData" ADD CONSTRAINT "MarketData_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candle" ADD CONSTRAINT "Candle_timeframeId_fkey" FOREIGN KEY ("timeframeId") REFERENCES "Timeframe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartView" ADD CONSTRAINT "ChartView_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChartView" ADD CONSTRAINT "ChartView_timeframeId_fkey" FOREIGN KEY ("timeframeId") REFERENCES "Timeframe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorResult" ADD CONSTRAINT "IndicatorResult_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "IndicatorSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorResult" ADD CONSTRAINT "IndicatorResult_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorResult" ADD CONSTRAINT "IndicatorResult_timeframeId_fkey" FOREIGN KEY ("timeframeId") REFERENCES "Timeframe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_tradingAccountId_fkey" FOREIGN KEY ("tradingAccountId") REFERENCES "TradingAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_expiryId_fkey" FOREIGN KEY ("expiryId") REFERENCES "Expiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycRecord" ADD CONSTRAINT "KycRecord_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliate" ADD CONSTRAINT "Affiliate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "Affiliate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_affiliateUserId_fkey" FOREIGN KEY ("affiliateUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateCommission" ADD CONSTRAINT "AffiliateCommission_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialFollow" ADD CONSTRAINT "SocialFollow_followerUserId_fkey" FOREIGN KEY ("followerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialFollow" ADD CONSTRAINT "SocialFollow_traderUserId_fkey" FOREIGN KEY ("traderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopyTrade" ADD CONSTRAINT "CopyTrade_socialFollowId_fkey" FOREIGN KEY ("socialFollowId") REFERENCES "SocialFollow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopyTrade" ADD CONSTRAINT "CopyTrade_masterUserId_fkey" FOREIGN KEY ("masterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopyTrade" ADD CONSTRAINT "CopyTrade_followerUserId_fkey" FOREIGN KEY ("followerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopyTrade" ADD CONSTRAINT "CopyTrade_masterTradeId_fkey" FOREIGN KEY ("masterTradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
