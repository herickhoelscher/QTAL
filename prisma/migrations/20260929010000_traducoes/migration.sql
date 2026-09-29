-- AlterTable
ALTER TABLE "ApiSettings" ADD COLUMN     "deeplApiKey" TEXT;

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Translation_model_recordId_idx" ON "Translation"("model", "recordId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_locale_model_recordId_field_key" ON "Translation"("locale", "model", "recordId", "field");

