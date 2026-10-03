import "server-only";
import { prisma } from "@/lib/prisma";
import { dequeue, enqueue, FEATURED_LIMIT, move, rankChanges } from "@/lib/featured";

export type FeaturedModel = "article" | "event" | "property" | "video" | "issue";

export const FEATURED_MODELS: FeaturedModel[] = ["article", "event", "property", "video", "issue"];

/** O que as funcoes daqui usam de cada tabela; os cinco modelos tem o mesmo campo. */
type RankDelegate = {
  findMany(args: {
    where: { featuredRank: { not: null } };
    select: { id: true; featuredRank: true };
    orderBy: { featuredRank: "asc" };
  }): Promise<{ id: string; featuredRank: number | null }[]>;
  update(args: { where: { id: string }; data: { featuredRank: number | null } }): Promise<unknown>;
};

const DELEGATES: Record<FeaturedModel, RankDelegate> = {
  article: prisma.article as unknown as RankDelegate,
  event: prisma.event as unknown as RankDelegate,
  property: prisma.property as unknown as RankDelegate,
  video: prisma.video as unknown as RankDelegate,
  issue: prisma.issue as unknown as RankDelegate,
};

export function isFeaturedModel(value: string): value is FeaturedModel {
  return (FEATURED_MODELS as string[]).includes(value);
}

async function load(model: FeaturedModel) {
  const rows = await DELEGATES[model].findMany({
    where: { featuredRank: { not: null } },
    select: { id: true, featuredRank: true },
    orderBy: { featuredRank: "asc" },
  });
  return rows.map((row) => ({ id: row.id, rank: row.featuredRank }));
}

async function save(model: FeaturedModel, before: { id: string; rank: number | null }[], after: string[]) {
  for (const change of rankChanges(before, after)) {
    await DELEGATES[model].update({ where: { id: change.id }, data: { featuredRank: change.rank } });
  }
}

export const FULL_MESSAGE = `Já há ${FEATURED_LIMIT} destaques nesta seção. Tire um na aba Destaques antes de marcar outro.`;

/**
 * Antes de salvar um formulario: marcar "Destaque" com a fila cheia e erro.
 * Checado antes de gravar, para nao criar o registro e recusar o destaque depois.
 */
export async function featuredCapacityError(
  model: FeaturedModel,
  id: string | null,
  wanted: boolean,
): Promise<string | null> {
  if (!wanted) return null;
  const before = await load(model);
  if (id && before.some((item) => item.id === id)) return null;
  return before.length >= FEATURED_LIMIT ? FULL_MESSAGE : null;
}

/** Poe ou tira dos destaques. Devolve "full" quando nao ha lugar. */
export async function setFeatured(
  model: FeaturedModel,
  id: string,
  wanted: boolean,
): Promise<"full" | null> {
  const before = await load(model);
  const queue = before.map((item) => item.id);
  if (!wanted) {
    await save(model, before, dequeue(queue, id));
    return null;
  }
  const result = enqueue(queue, id, FEATURED_LIMIT);
  if (!result.ok) return "full";
  await save(model, before, result.queue);
  return null;
}

export async function moveFeatured(model: FeaturedModel, id: string, delta: -1 | 1): Promise<void> {
  const before = await load(model);
  await save(
    model,
    before,
    move(
      before.map((item) => item.id),
      id,
      delta,
    ),
  );
}

/** Excluir um conteudo destacado abre o lugar dele: os de tras sobem. */
export async function compactFeatured(model: FeaturedModel): Promise<void> {
  const before = await load(model);
  await save(
    model,
    before,
    before.map((item) => item.id),
  );
}
