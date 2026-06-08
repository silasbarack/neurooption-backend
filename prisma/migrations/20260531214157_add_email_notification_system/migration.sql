/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Candle` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('DEPOSIT_SUCCESS', 'WITHDRAWAL_REQUEST', 'WITHDRAWAL_PROCESSING', 'WITHDRAWAL_COMPLETED', 'WITHDRAWAL_DECLINED', 'KYC_SUBMITTED', 'KYC_APPROVED', 'KYC_REJECTED', 'FORGOT_PASSWORD', 'SUPPORT_TICKET_CREATED', 'SUPPORT_REPLY');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('GENERATED', 'SENT', 'FAILED');

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Candle" DROP CONSTRAINT "Candle_assetId_fkey";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Candle";

-- CreateTable
CREATE TABLE "EmailNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'GENERATED',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "EmailNotification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmailNotification" ADD CONSTRAINT "EmailNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
