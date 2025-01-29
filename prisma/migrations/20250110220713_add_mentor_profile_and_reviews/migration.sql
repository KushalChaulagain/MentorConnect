/*
  Warnings:

  - You are about to drop the column `mentorId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `reviewerId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `expertise` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyRate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MentorSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hourlyRate` to the `MentorProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `availability` on table `MentorProfile` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `giverId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Made the column `comment` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `endTime` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `menteeId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mentorId` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "MentorSession" DROP CONSTRAINT "MentorSession_menteeId_fkey";

-- DropForeignKey
ALTER TABLE "MentorSession" DROP CONSTRAINT "MentorSession_mentorId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_mentorId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_reviewerId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "Review_reviewerId_mentorId_key";

-- DropIndex
DROP INDEX "Session_sessionToken_key";

-- AlterTable
ALTER TABLE "MentorProfile" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "expertise" TEXT[],
ADD COLUMN     "hourlyRate" INTEGER NOT NULL,
ALTER COLUMN "availability" SET NOT NULL,
ALTER COLUMN "availability" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "mentorId",
DROP COLUMN "reviewerId",
ADD COLUMN     "giverId" TEXT NOT NULL,
ADD COLUMN     "receiverId" TEXT NOT NULL,
ADD COLUMN     "sessionId" TEXT,
ALTER COLUMN "comment" SET NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "expires",
DROP COLUMN "sessionToken",
DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "menteeId" TEXT NOT NULL,
ADD COLUMN     "mentorId" TEXT NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "topic" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio",
DROP COLUMN "emailVerified",
DROP COLUMN "expertise",
DROP COLUMN "hourlyRate",
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "MentorSession";

-- DropTable
DROP TABLE "VerificationToken";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "SessionStatus";

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
