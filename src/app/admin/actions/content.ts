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

type GalleryInput = { url: string; altText?: string | null; album?: string | null };

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
    region: optional(formData, "region"),
    metaTitle: optional(formData, "metaTitle"),
    metaDescription: optional(formData, "metaDescription"),
    featured: formData.get("featured") === "on",
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
        position,
        articleId: article.id,
      })),
    });
  }

  revalidatePath("/materias");
  revalidatePath("/materias/" + article.slug);
  revalidatePath("/");
  redirect("/admin/materias?salvo=1");
}

export async function deleteArticle(formData: FormData) {
  await requireSession();
  await prisma.article.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/materias");
  revalidatePath("/materias");
}

// ------------------------------------------------------------------ Eventos

export async function saveEvent(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireSession();

  const id = text(formData, "id");
  const title = text(formData, "title");
  const dateValue = text(formData, "date");

  if (!title) return { error: "O título é obrigatório." };
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
    region: optional(formData, "region"),
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
        album: item.album || null,
        position,
        eventId: event.id,
      })),
    });
  }

  revalidatePath("/eventos");
  revalidatePath("/eventos/" + event.slug);
  revalidatePath("/");
  redirect("/admin/eventos?salvo=1");
}

export async function deleteEvent(formData: FormData) {
  await requireSession();
  await prisma.event.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
}

// ------------------------------------------------------------------ Imóveis

export async function saveProperty(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const id = text(formData, "id");
  const title = text(formData, "title");
  const city = text(formData, "city");

  if (!title) return { error: "O título é obrigatório." };
  if (!city) return { error: "Informe a cidade do imóvel." };

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
    city,
    region: optional(formData, "region"),
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
    mapEmbedUrl: optional(formData, "mapEmbedUrl"),
    tourUrl: optional(formData, "tourUrl"),
    featured: formData.get("featured") === "on",
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
        position,
        propertyId: property.id,
      })),
    });
  }

  revalidatePath("/imoveis");
  revalidatePath("/imoveis/" + property.slug);
  revalidatePath("/");
  redirect("/admin/imoveis?salvo=1");
}

export async function deleteProperty(formData: FormData) {
  await requireSession();
  await prisma.property.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/imoveis");
  revalidatePath("/imoveis");
}

// ------------------------------------------------------------------- Vídeos

export async function saveVideo(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireSession();

  const id = text(formData, "id");
  const title = text(formData, "title");
  const externalUrl = text(formData, "externalUrl");

  if (!title) return { error: "O título é obrigatório." };

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
    featured: formData.get("featured") === "on",
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

  revalidatePath("/videos");
  revalidatePath("/videos/" + video.slug);
  revalidatePath("/materias", "layout");
  revalidatePath("/imoveis", "layout");
  revalidatePath("/eventos", "layout");
  revalidatePath("/");
  redirect("/admin/videos?salvo=1");
}

export async function deleteVideo(formData: FormData) {
  await requireSession();
  await prisma.video.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
}

// ------------------------------------------------ Edições (Modo Revista)

export async function saveIssue(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireSession();

  const id = text(formData, "id");
  const title = text(formData, "title");
  if (!title) return { error: "O título da edição é obrigatório." };

  const slug = await uniqueSlug(text(formData, "slug") || title, async (candidate) => {
    const found = await prisma.issue.findUnique({ where: { slug: candidate } });
    return Boolean(found && found.id !== id);
  });

  const nextStatus = status(formData);
  const data = {
    title,
    slug,
    description: optional(formData, "description"),
    coverImage: optional(formData, "coverImage"),
    status: nextStatus,
    publishedAt: nextStatus === "PUBLISHED" ? new Date() : null,
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

  revalidatePath("/modo-revista/" + issue.slug);
  revalidatePath("/");
  redirect("/admin/edicoes?salvo=1");
}

export async function deleteIssue(formData: FormData) {
  await requireSession();
  await prisma.issue.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/edicoes");
}

// --------------------------------------------------------------- Categorias

export async function saveCategory(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const name = text(formData, "name");
  const type = text(formData, "type") as Prisma.CategoryCreateInput["type"];
  if (!name) return { error: "Informe o nome da categoria." };

  const slug = slugify(name);
  const existing = await prisma.category.findFirst({ where: { slug, type } });
  if (existing) return { error: "Já existe uma categoria com esse nome nesse módulo." };

  await prisma.category.create({ data: { name, slug, type } });
  revalidatePath("/admin/categorias");
  return { success: "Categoria criada." };
}

export async function deleteCategory(formData: FormData) {
  await requireSession();
  await prisma.category.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/categorias");
}
