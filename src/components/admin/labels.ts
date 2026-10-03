import type { AdminRole, CategoryType } from "@prisma/client";

/** Rotulos do painel, fora dos arquivos "use client" para servirem as paginas de servidor. */

export const CATEGORY_TYPES: { value: CategoryType; label: string }[] = [
  { value: "ARTICLE", label: "Matérias" },
  { value: "EVENT", label: "Eventos" },
  { value: "PROPERTY", label: "Imóveis" },
  { value: "VIDEO", label: "Vídeos" },
];

export const CATEGORY_TYPE_LABEL = Object.fromEntries(
  CATEGORY_TYPES.map((type) => [type.value, type.label]),
) as Record<CategoryType, string>;

export const ROLE_LABEL: Record<AdminRole, string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
};
