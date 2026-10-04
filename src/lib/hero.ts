import "server-only";
import type { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { excerpt } from "@/lib/format";
import { thumbnailUrl } from "@/lib/video";

export type HeroType = "article" | "event" | "property" | "video" | "issue";

/** Um slide do carrossel ja resolvido para o conteudo que ele aponta. */
export type HeroItem = {
  slideId: string;
  type: HeroType;
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  /** Caminho no site, sem prefixo de idioma. */
  href: string;
  status: ContentStatus;
};

const INCLUDE = {
  article: { select: { id: true, title: true, subtitle: true, body: true, coverImage: true, slug: true, status: true } },
  event: { select: { id: true, title: true, description: true, coverImage: true, slug: true, status: true } },
  property: { select: { id: true, title: true, description: true, coverImage: true, slug: true, status: true } },
  video: {
    select: {
      id: true,
      title: true,
      description: true,
      provider: true,
      embedId: true,
      customThumbnail: true,
      slug: true,
      status: true,
    },
  },
  issue: { select: { id: true, title: true, description: true, coverImage: true, slug: true, status: true } },
} as const;

/** Os slides em ordem, com o conteudo de cada um (registros mutaveis, para a traducao sobrepor). */
export async function loadHeroSlides() {
  return prisma.heroSlide.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    include: INCLUDE,
  });
}

type SlideRow = Awaited<ReturnType<typeof loadHeroSlides>>[number];

/** Converte a linha do banco no que o carrossel mostra. Slide orfao vira null. */
export function heroItem(slide: SlideRow): HeroItem | null {
  if (slide.article) {
    const a = slide.article;
    return {
      slideId: slide.id,
      type: "article",
      id: a.id,
      title: a.title,
      subtitle: a.subtitle ?? excerpt(a.body, 140),
      image: a.coverImage,
      href: "/materias/" + a.slug,
      status: a.status,
    };
  }
  if (slide.event) {
    const e = slide.event;
    return {
      slideId: slide.id,
      type: "event",
      id: e.id,
      title: e.title,
      subtitle: e.description ? excerpt(e.description, 140) : null,
      image: e.coverImage,
      href: "/eventos/" + e.slug,
      status: e.status,
    };
  }
  if (slide.property) {
    const p = slide.property;
    return {
      slideId: slide.id,
      type: "property",
      id: p.id,
      title: p.title,
      subtitle: p.description ? excerpt(p.description, 140) : null,
      image: p.coverImage,
      href: "/imoveis/" + p.slug,
      status: p.status,
    };
  }
  if (slide.video) {
    const v = slide.video;
    return {
      slideId: slide.id,
      type: "video",
      id: v.id,
      title: v.title,
      subtitle: v.description ? excerpt(v.description, 140) : null,
      image: thumbnailUrl(v.provider, v.embedId, v.customThumbnail),
      href: "/videos/" + v.slug,
      status: v.status,
    };
  }
  if (slide.issue) {
    const i = slide.issue;
    return {
      slideId: slide.id,
      type: "issue",
      id: i.id,
      title: i.title,
      subtitle: i.description ? excerpt(i.description, 140) : null,
      image: i.coverImage,
      href: "/edicoes/" + i.slug,
      status: i.status,
    };
  }
  return null;
}

/** Conteudo que pode virar slide: as abas do "Adicionar ao carrossel" no painel. */
export type HeroCandidate = {
  id: string;
  title: string;
  status: ContentStatus;
  image: string | null;
  date: Date | null;
};

/** Os mais recentes do tipo, ou os que tem o termo no titulo. */
export async function heroCandidates(
  type: HeroType,
  q: string,
  take: number,
): Promise<HeroCandidate[]> {
  const where = q ? { title: { contains: q, mode: "insensitive" as const } } : {};
  const base = { id: true, title: true, status: true } as const;

  switch (type) {
    case "article": {
      const rows = await prisma.article.findMany({
        where,
        take,
        orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
        select: { ...base, coverImage: true, publishedAt: true },
      });
      return rows.map((row) => ({ ...row, image: row.coverImage, date: row.publishedAt }));
    }
    case "event": {
      const rows = await prisma.event.findMany({
        where,
        take,
        orderBy: { date: "desc" },
        select: { ...base, coverImage: true, date: true },
      });
      return rows.map((row) => ({ ...row, image: row.coverImage }));
    }
    case "property": {
      const rows = await prisma.property.findMany({
        where,
        take,
        orderBy: { createdAt: "desc" },
        select: { ...base, coverImage: true, createdAt: true },
      });
      return rows.map((row) => ({ ...row, image: row.coverImage, date: row.createdAt }));
    }
    case "video": {
      const rows = await prisma.video.findMany({
        where,
        take,
        orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
        select: { ...base, provider: true, embedId: true, customThumbnail: true, publishedAt: true },
      });
      return rows.map((row) => ({
        ...row,
        image: thumbnailUrl(row.provider, row.embedId, row.customThumbnail),
        date: row.publishedAt,
      }));
    }
    case "issue": {
      const rows = await prisma.issue.findMany({
        where,
        take,
        orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
        select: { ...base, coverImage: true, publishedAt: true },
      });
      return rows.map((row) => ({ ...row, image: row.coverImage, date: row.publishedAt }));
    }
  }
}
