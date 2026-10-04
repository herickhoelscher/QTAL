-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "city" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "city" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "state" TEXT;


-- Dados: copia o que ja existe. A coluna "region" fica intacta, porque o site
-- publicado ainda le dela.
-- 1) Materias e eventos: tudo o que tinha regiao e do Parana. Quando a regiao
--    era o nome de uma cidade, ela vira a cidade; "Oeste do Paraná" fica so
--    com o estado.
UPDATE "Article" SET "state" = 'PR' WHERE "region" IS NOT NULL;
UPDATE "Article" SET "city" = "region" WHERE "region" IN ('Toledo', 'Marechal Cândido Rondon');

UPDATE "Event" SET "state" = 'PR' WHERE "region" IS NOT NULL;
UPDATE "Event" SET "city" = "region" WHERE "region" IN ('Toledo', 'Marechal Cândido Rondon');

-- 2) Imoveis: a cidade ja existia; a antiga "Região / bairro" vira o bairro.
UPDATE "Property" SET "state" = 'PR', "neighborhood" = "region";
