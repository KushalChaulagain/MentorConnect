/*
  Warnings:

  - You are about to drop the column `bookingId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `connectionId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_bookingId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "bookingId",
ADD COLUMN     "connectionId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Message_connectionId_idx" ON "Message"("connectionId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
