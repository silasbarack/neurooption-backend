/*
  Warnings:

  - You are about to alter the column `ticketId` on the `SupportMessage` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(7)`.
  - The primary key for the `SupportTicket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `SupportTicket` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(7)`.

*/
-- DropForeignKey
ALTER TABLE "SupportMessage" DROP CONSTRAINT "SupportMessage_ticketId_fkey";

-- AlterTable
ALTER TABLE "SupportMessage" ALTER COLUMN "ticketId" SET DATA TYPE VARCHAR(7);

-- AlterTable
ALTER TABLE "SupportTicket" DROP CONSTRAINT "SupportTicket_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(7),
ADD CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
