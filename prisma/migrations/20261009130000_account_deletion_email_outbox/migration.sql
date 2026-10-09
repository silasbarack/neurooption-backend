ALTER TABLE "User"
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletionReference" TEXT,
  ADD COLUMN "authTokenVersion" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "User_deletionReference_key" ON "User"("deletionReference");

-- No User FK: deletion receipts must retain the original delivery address until accepted.
CREATE TABLE "EmailOutbox" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "kind" TEXT NOT NULL,
  "deduplicationKey" TEXT NOT NULL,
  "recipient" TEXT,
  "subject" TEXT NOT NULL,
  "body" TEXT,
  "html" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leaseToken" TEXT,
  "lockedUntil" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "resetTokenId" TEXT,
  "acceptedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmailOutbox_deduplicationKey_key" ON "EmailOutbox"("deduplicationKey");
CREATE INDEX "EmailOutbox_status_nextAttemptAt_idx" ON "EmailOutbox"("status", "nextAttemptAt");
CREATE INDEX "EmailOutbox_userId_kind_idx" ON "EmailOutbox"("userId", "kind");
