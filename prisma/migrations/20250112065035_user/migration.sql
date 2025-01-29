/*
  Warnings:

  - The values [ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingCompleted` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Availability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MentorProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MentorReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordReset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('MENTOR', 'MENTEE');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'MENTEE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_mentorProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_menteeId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_mentorProfileId_fkey";

-- DropForeignKey
ALTER TABLE "MentorProfile" DROP CONSTRAINT "MentorProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "MentorReview" DROP CONSTRAINT "MentorReview_authorId_fkey";

-- DropForeignKey
ALTER TABLE "MentorReview" DROP CONSTRAINT "MentorReview_mentorProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "PasswordReset" DROP CONSTRAINT "PasswordReset_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashedPassword",
DROP COLUMN "onboardingCompleted",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Availability";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "MentorProfile";

-- DropTable
DROP TABLE "MentorReview";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "PasswordReset";

-- DropTable
DROP TABLE "Session";

-- DropEnum
DROP TYPE "BookingStatus";
