-- DropForeignKey
ALTER TABLE "Commit" DROP CONSTRAINT "Commit_projectId_fkey";

-- DropForeignKey
ALTER TABLE "UserToProject" DROP CONSTRAINT "UserToProject_projectId_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "isFirstTimeSetup" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "UserToProject" ADD CONSTRAINT "UserToProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
