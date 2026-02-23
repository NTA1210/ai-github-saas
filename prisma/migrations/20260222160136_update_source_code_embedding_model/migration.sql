/*
  Warnings:

  - A unique constraint covering the columns `[projectId,branch,fileName]` on the table `SourceCodeEmbedding` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `branch` to the `SourceCodeEmbedding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SourceCodeEmbedding" ADD COLUMN     "branch" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SourceCodeEmbedding_projectId_branch_fileName_key" ON "SourceCodeEmbedding"("projectId", "branch", "fileName");
