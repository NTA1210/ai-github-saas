-- AlterTable
ALTER TABLE "InviteLink" ADD COLUMN     "revokedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "InviteLink_revokedAt_idx" ON "InviteLink"("revokedAt");
