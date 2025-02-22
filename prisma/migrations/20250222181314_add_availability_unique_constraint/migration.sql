/*
  Warnings:

  - A unique constraint covering the columns `[mentorProfileId,day]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Availability_mentorProfileId_day_key" ON "Availability"("mentorProfileId", "day");
