"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { HERO_LIMIT, dequeue, enqueue, move, rankChanges } from "@/lib/featured";
import { isFeaturedModel, moveFeatured, setFeatured } from "@/lib/featured-db";
import { prisma } from "@/lib/prisma";

function field(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** Volta para a lista de onde veio o clique. So aceita destinos dentro do painel. */
function back(formData: FormData, extra?: string): never {
  const target = field(formData, "back");
  const base = target.startsWith("/admin/") ? target : "/admin/dashboard";
  redirect(extra ? base + (base.includes("?") ? "&" : "?") + extra : base);
}

function revalidateSite() {
  revalidatePath("/[lang]", "layout");
}

// ---------------------------------------------------------------- Destaques

/** A estrela das listas: marca ou desmarca o destaque. */
export async function toggleFeatured(formData: FormData) {
  await requireSession();
  const model = field(formData, "model");
  const id = field(formData, "id");
  if (!isFeaturedModel(model) || !id) back(formData);

  const result = await setFeatured(model, id, field(formData, "wanted") === "1");
  revalidatePath("/admin", "layout");
  revalidateSite();
  back(formData, result === "full" ? "aviso=destaques-cheios" : undefined);
}

/** Setas da aba Destaques. */
export async function reorderFeatured(formData: FormData) {
  await requireSession();
  const model = field(formData, "model");
  const id = field(formData, "id");
  if (!isFeaturedModel(model) || !id) back(formData);

  await moveFeatured(model, id, field(formData, "dir") === "up" ? -1 : 1);
  revalidatePath("/admin", "layout");
  revalidateSite();
  back(formData);
}

// ---------------------------------------------------------------- Carrossel

const HERO_TYPES = ["article", "event", "property", "video", "issue"] as const;
type HeroType = (typeof HERO_TYPES)[number];

async function heroQueue() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true, position: true },
  });
  // rankChanges trabalha com posicoes a partir de 1; o banco guarda a partir de 0.
  return slides.map((slide) => ({ id: slide.id, rank: slide.position + 1 }));
}

async function saveHero(before: { id: string; rank: number | null }[], after: string[]) {
  for (const change of rankChanges(before, after)) {
    if (change.rank !== null) {
      await prisma.heroSlide.update({ where: { id: change.id }, data: { position: change.rank - 1 } });
    }
  }
}

export async function addHeroSlide(formData: FormData) {
  await requireSession();
  const type = field(formData, "type") as HeroType;
  const id = field(formData, "id");
  if (!HERO_TYPES.includes(type) || !id) back(formData);

  const before = await heroQueue();
  const already = await prisma.heroSlide.findFirst({ where: { [type + "Id"]: id } });
  if (already) back(formData, "aviso=ja-no-carrossel");
  if (!enqueue(before.map((item) => item.id), "novo", HERO_LIMIT).ok) {
    back(formData, "aviso=carrossel-cheio");
  }

  await prisma.heroSlide.create({ data: { position: before.length, [type + "Id"]: id } });
  revalidatePath("/admin/carrossel");
  revalidateSite();
  back(formData);
}

export async function removeHeroSlide(formData: FormData) {
  await requireSession();
  const id = field(formData, "id");
  await prisma.heroSlide.delete({ where: { id } });
  const before = await heroQueue();
  await saveHero(
    before,
    dequeue(
      before.map((item) => item.id),
      id,
    ),
  );
  revalidatePath("/admin/carrossel");
  revalidateSite();
  back(formData);
}

export async function reorderHeroSlide(formData: FormData) {
  await requireSession();
  const id = field(formData, "id");
  const before = await heroQueue();
  await saveHero(
    before,
    move(
      before.map((item) => item.id),
      id,
      field(formData, "dir") === "up" ? -1 : 1,
    ),
  );
  revalidatePath("/admin/carrossel");
  revalidateSite();
  back(formData);
}
