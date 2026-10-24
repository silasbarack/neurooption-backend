-- Administrator replies on support tickets: the client sender becomes optional
-- and the replying administrator is recorded.
ALTER TABLE "SupportMessage" ALTER COLUMN "senderId" DROP NOT NULL;
ALTER TABLE "SupportMessage" ADD COLUMN "adminId" TEXT;
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "SupportMessage_ticketId_createdAt_idx" ON "SupportMessage"("ticketId", "createdAt");

-- Newsletter sign-ups.
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT,
    "unsubscribeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "unsubscribedAt" TIMESTAMP(3),
    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
CREATE UNIQUE INDEX "NewsletterSubscriber_unsubscribeToken_key" ON "NewsletterSubscriber"("unsubscribeToken");

-- An optional relation uses SET NULL, matching the Prisma schema.
ALTER TABLE "SupportMessage" DROP CONSTRAINT "SupportMessage_senderId_fkey";
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
