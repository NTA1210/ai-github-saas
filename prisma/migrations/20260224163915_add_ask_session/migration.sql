-- CreateTable
CREATE TABLE "AskSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AskSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AskSession_expiresAt_idx" ON "AskSession"("expiresAt");
