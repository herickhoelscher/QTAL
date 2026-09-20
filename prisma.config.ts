import { defineConfig } from "prisma/config";

// Prisma 7 nao le mais `url` do schema.prisma nem carrega o .env sozinho.
process.loadEnvFile?.(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
