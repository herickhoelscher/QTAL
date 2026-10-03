-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "featuredRank" INTEGER;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "featuredRank" INTEGER;

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "featuredRank" INTEGER;

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "issueId" TEXT;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "featuredRank" INTEGER;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "featuredRank" INTEGER;

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" TEXT,
    "eventId" TEXT,
    "propertyId" TEXT,
    "videoId" TEXT,
    "issueId" TEXT,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroSlide_position_idx" ON "HeroSlide"("position");

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Dados: nada do que esta no ar some.
-- 1) As materias marcadas hoje como "Destacar no carrossel" viram os slides,
--    da mais recente para a mais antiga (ate 8).
INSERT INTO "HeroSlide" ("id", "position", "articleId")
SELECT gen_random_uuid()::text, (row_number() OVER (ORDER BY "publishedAt" DESC NULLS LAST)) - 1, "id"
FROM "Article"
WHERE "featured" = true
ORDER BY "publishedAt" DESC NULLS LAST
LIMIT 8;

-- 2) Imoveis e videos ja marcados como destaque entram na fila, ate 6.
UPDATE "Property" p SET "featuredRank" = r.rank
FROM (
  SELECT "id", row_number() OVER (ORDER BY "createdAt" DESC) AS rank
  FROM "Property" WHERE "featured" = true
) r
WHERE p."id" = r."id" AND r.rank <= 6;

UPDATE "Video" v SET "featuredRank" = r.rank
FROM (
  SELECT "id", row_number() OVER (ORDER BY "publishedAt" DESC NULLS LAST) AS rank
  FROM "Video" WHERE "featured" = true
) r
WHERE v."id" = r."id" AND r.rank <= 6;
