-- AlterTable
ALTER TABLE "ApiSettings" ADD COLUMN     "cubAutoUpdate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cubChangePercent" DECIMAL(6,2),
ADD COLUMN     "cubSource" TEXT;
