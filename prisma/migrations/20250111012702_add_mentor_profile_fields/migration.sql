/*
  Warnings:

  - Added the required column `experience` to the `MentorProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MentorProfile" ADD COLUMN     "experience" TEXT NOT NULL,
ADD COLUMN     "goals" TEXT[],
ADD COLUMN     "interests" TEXT[];
