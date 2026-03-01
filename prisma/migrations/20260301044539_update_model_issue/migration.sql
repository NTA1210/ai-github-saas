/*
  Warnings:

  - You are about to drop the column `endAt` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `startAt` on the `Issue` table. All the data in the column will be lost.
  - Added the required column `end` to the `Issue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Issue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "endAt",
DROP COLUMN "startAt",
ADD COLUMN     "end" TEXT NOT NULL,
ADD COLUMN     "start" TEXT NOT NULL;
