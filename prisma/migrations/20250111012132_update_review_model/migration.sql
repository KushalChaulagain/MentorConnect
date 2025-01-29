/*
  Warnings:

  - You are about to drop the column `availability` on the `MentorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `MentorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `MentorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `MentorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `MentorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingCompleted` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `MentorshipSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordReset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MENTOR', 'MENTEE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "MentorshipSession" DROP CONSTRAINT "MentorshipSession_menteeId_fkey";

-- DropForeignKey
ALTER TABLE "MentorshipSession" DROP CONSTRAINT "MentorshipSession_mentorId_fkey";

-- DropForeignKey
ALTER TABLE "PasswordReset" DROP CONSTRAINT "PasswordReset_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_giverId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- AlterTable
ALTER TABLE "MentorProfile" DROP COLUMN "availability",
DROP COLUMN "createdAt",
DROP COLUMN "education",
DROP COLUMN "experience",
DROP COLUMN "updatedAt",
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "hourlyRate" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "hashedPassword",
DROP COLUMN "onboardingCompleted",
DROP COLUMN "updatedAt",
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MENTEE';

-- DropTable
DROP TABLE "MentorshipSession";

-- DropTable
DROP TABLE "PasswordReset";

-- DropTable
DROP TABLE "Review";

-- DropTable
DROP TABLE "profiles";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "MentorReview" (
    "id" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "slots" JSONB NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "menteeId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MentorReview" ADD CONSTRAINT "MentorReview_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorReview" ADD CONSTRAINT "MentorReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_menteeId_fkey" FOREIGN KEY ("menteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
