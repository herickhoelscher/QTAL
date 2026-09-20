import { defineConfig } from "prisma/config";

// Prisma 7 nao le mais `url` do schema.prisma nem carrega o .env sozinho.
// Em producao (Vercel) o arquivo nao existe e loadEnvFile lanca ENOENT — as
// variaveis ja vem do proprio ambiente, entao a falta do arquivo e esperada.
try {
  process.loadEnvFile?.(".env");
} catch {
  // sem .env: seguimos com as variaveis de ambiente
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
