/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `menteeId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `mentorId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `topic` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Made the column `sessionId` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `expires` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionToken` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_giverId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_menteeId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_mentorId_fkey";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "comment" DROP NOT NULL,
ALTER COLUMN "sessionId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "endTime",
DROP COLUMN "menteeId",
DROP COLUMN "mentorId",
DROP COLUMN "startTime",
DROP COLUMN "status",
DROP COLUMN "topic",
DROP COLUMN "updatedAt",
ADD COLUMN     "expires" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sessionToken" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipSession" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mentorId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,

    CONSTRAINT "MentorshipSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MentorshipSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
