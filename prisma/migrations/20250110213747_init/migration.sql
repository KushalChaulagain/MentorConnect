/*
  Warnings:

  - You are about to drop the column `menteeId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `menteeId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `mentorId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `topic` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reviewerId,mentorId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sessionToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `MentorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewerId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionToken` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- DropForeignKey
ALTER TABLE "MentorProfile" DROP CONSTRAINT "MentorProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_menteeId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_mentorId_fkey";

-- AlterTable
ALTER TABLE "MentorProfile" ADD COLUMN     "company" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "availability" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "menteeId",
ADD COLUMN     "reviewerId" TEXT NOT NULL;

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
ALTER TABLE "User" DROP COLUMN "company",
DROP COLUMN "title",
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

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
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "MentorSession" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING',
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Review_reviewerId_mentorId_key" ON "Review"("reviewerId", "mentorId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorProfile" ADD CONSTRAINT "MentorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorSession" ADD CONSTRAINT "MentorSession_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorSession" ADD CONSTRAINT "MentorSession_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
