/*
  Warnings:

  - You are about to drop the column `fileReferences` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "fileReferences";

-- CreateTable
CREATE TABLE "QuestionReference" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionId" TEXT NOT NULL,
    "sourceCodeEmbeddingId" TEXT NOT NULL,

    CONSTRAINT "QuestionReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionReference_questionId_idx" ON "QuestionReference"("questionId");

-- CreateIndex
CREATE INDEX "QuestionReference_sourceCodeEmbeddingId_idx" ON "QuestionReference"("sourceCodeEmbeddingId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionReference_questionId_sourceCodeEmbeddingId_key" ON "QuestionReference"("questionId", "sourceCodeEmbeddingId");

-- AddForeignKey
ALTER TABLE "QuestionReference" ADD CONSTRAINT "QuestionReference_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReference" ADD CONSTRAINT "QuestionReference_sourceCodeEmbeddingId_fkey" FOREIGN KEY ("sourceCodeEmbeddingId") REFERENCES "SourceCodeEmbedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
