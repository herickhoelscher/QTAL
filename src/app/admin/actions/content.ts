"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ContentStatus, Prisma, PropertyType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";
import { slugify, uniqueSlug } from "@/lib/slug";
import { parseVideoUrl } from "@/lib/video";
import type { ActionState } from "@/app/admin/actions/auth";
import { deleteTranslations, translateRecord } from "@/lib/i18n/content";
import { compactFeatured, featuredCapacityError, setFeatured } from "@/lib/featured-db";
import { canonicalNeighborhood, collapseSpaces, isUf } from "@/lib/location";
import { listNeighborhoods } from "@/lib/location-db";
import { isShortMapLink, resolveShortMapLink, toMapEmbedUrl } from "@/lib/maps";

type GalleryInput = {
  url: string;
  altText?: string | null;
  album?: string | null;
  featured?: boolean;
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optional(formData: FormData, key: string): string | null {
  const value = text(formData, key);
  return value === "" ? null : value;
}

function number(formData: FormData, key: string): number | null {
  const value = text(formData, key);
  if (value === "") return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function integer(formData: FormData, key: string): number | null {
  const value = number(formData, key);
  return value === null ? null : Math.trunc(value);
}

function status(formData: FormData): ContentStatus {
  return text(formData, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
}

function parseGallery(formData: FormData, key: string): GalleryInput[] {
  try {
    const parsed = JSON.parse(text(formData, key) || "[]") as GalleryInput[];
    return Array.isArray(parsed) ? parsed.filter((item) => Boolean(item?.url)) : [];
  } catch {
    return [];
  }
}

/**
 * Renova o cache das paginas publicas nos tres idiomas. Elas vivem sob
 * app/[lang], entao um caminho solto ("/materias") nao alcancaria /en e /es.
 */
function revalidateSite() {
  revalidatePath("/[lang]", "layout");
}

/**
 * Excluir pela pagina Ver: ela deixa de existir, entao volta para a lista.
 * So aceita destinos dentro do painel.
 */
function afterDelete(formData: FormData) {
  const target = text(formData, "redirectTo");
  if (target.startsWith("/admin/")) redirect(target);
}

/**
 * Estado, cidade e bairro vindos do LocationFields. Bairro digitado que ja
 * existe na cidade com outra grafia ("centro") e gravado como o existente.
 */
async function placeFields(formData: FormData) {
  const uf = text(formData, "state");
  const state = isUf(uf) ? uf : null;
  const city = collapseSpaces(text(formData, "city")) || null;
  const existing = state && city ? await listNeighborhoods(state, city) : [];
  const neighborhood = city ? canonicalNeighborhood(text(formData, "neighborhood"), existing) : null;
  return { state, city, neighborhood };
}

/**
 * Link do mapa do imovel: aceita o link de compartilhar do Google Maps, o da
 * barra de endereco ou o codigo de "Incorporar um mapa", e grava sempre o
 * formato que o Google deixa abrir dentro do site.
 */
async function mapField(formData: FormData): Promise<{ url: string | null } | { error: string }> {
  const raw = text(formData, "mapEmbedUrl");
  if (!raw) return { url: null };
  const full = isShortMapLink(raw) ? await resolveShortMapLink(raw) : raw;
  const url = full ? toMapEmbedUrl(full) : null;
  if (!url) {
    return {
      error:
        "Não consegui ler o link do mapa. No Google Maps, abra o lugar, clique em Compartilhar e cole o link (ou o código de Incorporar um mapa).",
    };
  }
  return { url };
}

function categoryIds(formData: FormData): string[] {
  return formData.getAll("categories").map(String).filter(Boolean);
}

// ---------------------------------------------------------------- Matérias

export async function saveArticle(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  const id = text(formData, "id");
  const title = text(formData, "title");
  const body = sanitizeHtml(text(formData, "body"));

  if (!title) return { error: "O título é obrigatório." };
  const wantsFeatured = formData.get("featured") === "on";
  const featuredError = await featuredCapacityError("article", id || null, wantsFeatured);
  if (featuredError) return { error: featuredError };
  if (!body || body === "<p></p>") return { error: "Escreva o corpo da matéria." };

  const desiredSlug = text(formData, "slug") || title;
  const slug = await uniqueSlug(desiredSlug, async (candidate) => {
    const found = await prisma.article.findUnique({ where: { slug: candidate } });
    return Boolean(found && found.id !== id);
  });

  const publishedAtValue = text(formData, "publishedAt");
  const nextStatus = status(formData);

  const data = {
    title,
    slug,
    subtitle: optional(formData, "subtitle"),
    body,
    coverImage: optional(formData, "coverImage"),
    coverAlt: optional(formData, "coverAlt"),
    ...(await placeFields(formData)),
    metaTitle: optional(formData, "metaTitle"),
    metaDescription: optional(formData, "metaDescription"),
    status: nextStatus,
    publishedAt: publishedAtValue
      ? new Date(publishedAtValue)
      : nextStatus === "PUBLISHED"
        ? new Date()
        : null,
  };

  const categories = categoryIds(formData).map((categoryId) => ({ id: categoryId }));
  const gallery = parseGallery(formData, "gallery");

  const article = id
    ? await prisma.article.update({
        where: { id },
        data: { ...data, categories: { set: categories } },
      })
    : await prisma.article.create({
        data: {
          ...data,
          categories: { connect: categories },
          author: { connect: { id: session.id } },
        },
      });

  await prisma.mediaAsset.deleteMany({ where: { articleId: article.id } });
  if (gallery.length) {
    await prisma.mediaAsset.createMany({
      data: gallery.map((item, position) => ({
        url: item.url,
        altText: item.altText || null,
        featured: Boolean(item.featured),
        position,
        articleId: article.id,
      })),
    });
  }

  if (article.status === "PUBLISHED") await translateRecord("article", article.id);
  await setFeatured("article", article.id, wantsFeatured);
  revalidateSite();
  redirect("/admin/materias?salvo=1");
}

export async function deleteArticle(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id"));
  await prisma.article.delete({ where: { id } });
  await compactFeatured("article");
  await deleteTranslations("article", id);
  revalidatePath("/admin/materias");
  revalidateSite();
  afterDelete(formData);
}

// ------------------------------------------------------------------ Eventos

export async function saveEvent(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireSession();

  const id = text(formData, "id");
  const title = text(formData, "title");
  const dateValue = text(formData, "date");

  if (!title) return { error: "O título é obrigatório." };
  const wantsFeatured = formData.get("featured") === "on";
  const featuredError = await featuredCapacityError("event", id || null, wantsFeatured);
  if (featuredError) return { error: featuredError };
  if (!dateValue) return { error: "Informe a data do evento." };

  const slug = await uniqueSlug(text(formData, "slug") || title, async (candidate) => {
    const found = await prisma.event.findUnique({ where: { slug: candidate } });
    return Boolean(found && found.id !== id);
  });

  const data = {
    title,
    slug,
    description: optional(formData, "description")
      ? sanitizeHtml(text(formData, "description"))
      : null,
    date: new Date(dateValue),
    location: optional(formData, "location"),
    ...(await placeFields(formData)),
    coverImage: optional(formData, "coverImage"),
    coverAlt: optional(formData, "coverAlt"),
    status: status(formData),
  };

  const categories = categoryIds(formData).map((categoryId) => ({ id: categoryId }));

  const event = id
    ? await prisma.event.update({
        where: { id },
        data: { ...data, categories: { set: categories } },
      })
    : await prisma.event.create({ data: { ...data, categories: { connect: categories } } });

  const gallery = parseGallery(formData, "gallery");
  await prisma.mediaAsset.deleteMany({ where: { eventId: event.id } });
  if (gallery.length) {
    await prisma.mediaAsset.createMany({
      data: gallery.map((item, position) => ({
        url: item.url,
        altText: item.altText || null,
        featured: Boolean(item.featured),
        album: item.album || null,
        position,
        eventId: event.id,
      })),
    });
  }

  if (event.status === "PUBLISHED") await translateRecord("event", event.id);
  await setFeatured("event", event.id, wantsFeatured);
  revalidateSite();
  redirect("/admin/eventos?salvo=1");
}

export async function deleteEvent(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id"));
  await prisma.event.delete({ where: { id } });
  await compactFeatured("event");
  await deleteTranslations("event", id);
  revalidatePath("/admin/eventos");
  revalidateSite();
  afterDelete(formData);
}

// ------------------------------------------------------------------ Imóveis

export async function saveProperty(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const id = text(formData, "id");
  const title = text(formData, "title");
  const place = await placeFields(formData);

  if (!title) return { error: "O título é obrigatório." };
  const wantsFeatured = formData.get("featured") === "on";
  const featuredError = await featuredCapacityError("property", id || null, wantsFeatured);
  if (featuredError) return { error: featuredError };
  if (!place.city) return { error: "Informe a cidade do imóvel." };
  const map = await mapField(formData);
  if ("error" in map) return { error: map.error };

  const slug = await uniqueSlug(text(formData, "slug") || title, async (candidate) => {
    const found = await prisma.property.findUnique({ where: { slug: candidate } });
    return Boolean(found && found.id !== id);
  });

  const priceOnRequest = formData.get("priceOnRequest") === "on";
  const price = number(formData, "price");

  const data = {
    title,
    slug,
    type: (text(formData, "type") || "CASA") as PropertyType,
    ...place,
    city: place.city,
    address: optional(formData, "address"),
    price: priceOnRequest ? null : price,
    priceOnRequest,
    area: number(formData, "area"),
    bedrooms: integer(formData, "bedrooms"),
    bathrooms: integer(formData, "bathrooms"),
    garageSpots: integer(formData, "garageSpots"),
    description: optional(formData, "description")
      ? sanitizeHtml(text(formData, "description"))
      : null,
    coverImage: optional(formData, "coverImage"),
    coverAlt: optional(formData, "coverAlt"),
    mapEmbedUrl: map.url,
    tourUrl: optional(formData, "tourUrl"),
    status: status(formData),
  };

  const property = id
    ? await prisma.property.update({ where: { id }, data })
    : await prisma.property.create({ data });

  const gallery = parseGallery(formData, "gallery");
  await prisma.mediaAsset.deleteMany({ where: { propertyId: property.id } });
  if (gallery.length) {
    await prisma.mediaAsset.createMany({
      data: gallery.map((item, position) => ({
        url: item.url,
        altText: item.altText || null,
        featured: Boolean(item.featured),
        position,
        propertyId: property.id,
      })),
    });
  }

  if (property.status === "PUBLISHED") await translateRecord("property", property.id);
  await setFeatured("property", property.id, wantsFeatured);
  revalidateSite();
  redirect("/admin/imoveis?salvo=1");
}

export async function deleteProperty(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id"));
  await prisma.property.delete({ where: { id } });
  await compactFeatured("property");
  await deleteTranslations("property", id);
  revalidatePath("/admin/imoveis");
  revalidateSite();
  afterDelete(formData);
}

// ------------------------------------------------------------------- Vídeos

export async function saveVideo(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireSession();

  const id = text(formData, "id");
  const title = text(formData, "title");
  const externalUrl = text(formData, "externalUrl");

  if (!title) return { error: "O título é obrigatório." };
  const wantsFeatured = formData.get("featured") === "on";
  const featuredError = await featuredCapacityError("video", id || null, wantsFeatured);
  if (featuredError) return { error: featuredError };

  const parsed = parseVideoUrl(externalUrl);
  if (!parsed) {
    return {
      error:
        "Link não reconhecido. Cole o endereço do vídeo no YouTube (youtube.com/watch, youtu.be, shorts) ou o permalink do post no Instagram.",
    };
  }

  const slug = await uniqueSlug(text(formData, "slug") || title, async (candidate) => {
    const found = await prisma.video.findUnique({ where: { slug: candidate } });
    return Boolean(found && found.id !== id);
  });

  const nextStatus = status(formData);

  const data = {
    title,
    slug,
    description: optional(formData, "description"),
    provider: parsed.provider,
    externalUrl,
    embedId: parsed.embedId,
    customThumbnail: optional(formData, "customThumbnail"),
    // A caixa so aparece no formulario depois que o link foi colado; sem ela,
    // vale o palpite do proprio link (shorts/reel = retrato).
    vertical: formData.has("vertical") ? formData.get("vertical") === "on" : parsed.vertical,
    status: nextStatus,
    publishedAt: nextStatus === "PUBLISHED" ? new Date() : null,
  };

  const categories = categoryIds(formData).map((categoryId) => ({ id: categoryId }));
  // Os tres vinculos sao independentes e opcionais: o mesmo video pode ilustrar
  // um evento, uma materia e um imovel ao mesmo tempo, sem novo cadastro.
  const eventId = optional(formData, "eventId");
  const articleId = optional(formData, "articleId");
  const propertyId = optional(formData, "propertyId");

  const video = id
    ? await prisma.video.update({
        where: { id },
        data: {
          ...data,
          categories: { set: categories },
          event: eventId ? { connect: { id: eventId } } : { disconnect: true },
          article: articleId ? { connect: { id: articleId } } : { disconnect: true },
          property: propertyId ? { connect: { id: propertyId } } : { disconnect: true },
        },
      })
    : await prisma.video.create({
        data: {
          ...data,
          categories: { connect: categories },
          ...(eventId ? { event: { connect: { id: eventId } } } : {}),
          ...(articleId ? { article: { connect: { id: articleId } } } : {}),
          ...(propertyId ? { property: { connect: { id: propertyId } } } : {}),
        },
      });

  if (video.status === "PUBLISHED") await translateRecord("video", video.id);
  // O video aparece tambem em materias, eventos e imoveis: renova o site todo.
  await setFeatured("video", video.id, wantsFeatured);
  revalidateSite();
  redirect("/admin/videos?salvo=1");
}

export async function deleteVideo(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id"));
  await prisma.video.delete({ where: { id } });
  await compactFeatured("video");
  await deleteTranslations("video", id);
  revalidatePath("/admin/videos");
  revalidateSite();
  afterDelete(formData);
}

// ------------------------------------------------ Edições (Modo Revista)

export async function saveIssue(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireSession();

  const id = text(formData, "id");
  const title = text(formData, "title");
  if (!title) return { error: "O título da edição é obrigatório." };
  const wantsFeatured = formData.get("featured") === "on";
  const featuredError = await featuredCapacityError("issue", id || null, wantsFeatured);
  if (featuredError) return { error: featuredError };

  const slug = await uniqueSlug(text(formData, "slug") || title, async (candidate) => {
    const found = await prisma.issue.findUnique({ where: { slug: candidate } });
    return Boolean(found && found.id !== id);
  });

  const nextStatus = status(formData);
  // Editar uma edicao ja publicada nao muda a data dela: e a data que decide
  // qual e a edicao atual e quais sao as anteriores.
  const previous = id
    ? await prisma.issue.findUnique({ where: { id }, select: { publishedAt: true } })
    : null;
  const data = {
    title,
    slug,
    description: optional(formData, "description"),
    coverImage: optional(formData, "coverImage"),
    coverTitle: optional(formData, "coverTitle"),
    coverSubtitle: optional(formData, "coverSubtitle"),
    status: nextStatus,
    publishedAt: nextStatus === "PUBLISHED" ? (previous?.publishedAt ?? new Date()) : null,
  };

  const issue = id
    ? await prisma.issue.update({ where: { id }, data })
    : await prisma.issue.create({ data });

  // A ordem dos ids define a sequencia de leitura no Modo Revista.
  const articleIds = formData.getAll("articleIds").map(String).filter(Boolean);
  await prisma.issueItem.deleteMany({ where: { issueId: issue.id } });
  if (articleIds.length) {
    await prisma.issueItem.createMany({
      data: articleIds.map((articleId, position) => ({
        issueId: issue.id,
        articleId,
        position,
      })),
    });
  }

  // Paginas da revista folheavel, na ordem em que ficaram no campo.
  const pages = parseGallery(formData, "pages");
  await prisma.mediaAsset.deleteMany({ where: { issueId: issue.id } });
  if (pages.length) {
    await prisma.mediaAsset.createMany({
      data: pages.map((item, position) => ({
        url: item.url,
        altText: item.altText || null,
        position,
        issueId: issue.id,
      })),
    });
  }

  if (issue.status === "PUBLISHED") await translateRecord("issue", issue.id);
  await setFeatured("issue", issue.id, wantsFeatured);
  revalidateSite();
  redirect("/admin/edicoes?salvo=1");
}

export async function deleteIssue(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id"));
  await prisma.issue.delete({ where: { id } });
  await compactFeatured("issue");
  await deleteTranslations("issue", id);
  revalidatePath("/admin/edicoes");
  revalidateSite();
  afterDelete(formData);
}

// --------------------------------------------------------------- Categorias

export async function saveCategory(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const id = text(formData, "id");
  const name = text(formData, "name");
  const type = text(formData, "type") as Prisma.CategoryCreateInput["type"];
  if (!name) return { error: "Informe o nome da categoria." };

  const slug = slugify(name);
  const existing = await prisma.category.findFirst({
    where: { slug, type, ...(id ? { id: { not: id } } : {}) },
  });
  if (existing) return { error: "Já existe uma categoria com esse nome nesse módulo." };

  const category = id
    ? await prisma.category.update({ where: { id }, data: { name, slug, type } })
    : await prisma.category.create({ data: { name, slug, type } });
  await translateRecord("category", category.id);
  revalidatePath("/admin/categorias");
  revalidateSite();
  redirect("/admin/categorias?salvo=1");
}

export async function deleteCategory(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id"));
  await prisma.category.delete({ where: { id } });
  await deleteTranslations("category", id);
  revalidatePath("/admin/categorias");
  revalidateSite();
  afterDelete(formData);
}
