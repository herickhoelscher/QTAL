import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

import { SITE_URL } from "@/lib/site-url";
import { LOCALES, LOCALE_TAG, localePath } from "@/lib/i18n/locales";

type Entry = MetadataRoute.Sitemap[number];

/**
 * Cada pagina entra nas tres versoes (pt, en, es), e cada versao lista as
 * outras como alternativas — e o formato que o Google usa para hreflang.
 */
function localized(path: string, entry: Omit<Entry, "url" | "alternates">): Entry[] {
  const languages = Object.fromEntries(
    LOCALES.map((locale) => [LOCALE_TAG[locale], SITE_URL + localePath(path, locale)]),
  );
  return LOCALES.map((locale) => ({
    ...entry,
    url: SITE_URL + localePath(path, locale),
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, events, properties, videos, issues, categories] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.event.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.property.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.video.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.issue.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ where: { type: "ARTICLE" }, select: { slug: true } }),
  ]);

  const staticRoutes = ["", "/materias", "/eventos", "/imoveis", "/videos", "/edicoes", "/anuncie", "/sobre"];

  return [
    ...staticRoutes.flatMap((route) =>
      localized(route || "/", {
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: route === "" ? 1 : 0.8,
      }),
    ),
    ...categories.flatMap((category) =>
      localized("/materias/categoria/" + category.slug, {
        changeFrequency: "weekly",
        priority: 0.6,
      }),
    ),
    ...articles.flatMap((item) =>
      localized("/materias/" + item.slug, { lastModified: item.updatedAt, priority: 0.7 }),
    ),
    ...events.flatMap((item) =>
      localized("/eventos/" + item.slug, { lastModified: item.updatedAt, priority: 0.7 }),
    ),
    ...properties.flatMap((item) =>
      localized("/imoveis/" + item.slug, { lastModified: item.updatedAt, priority: 0.7 }),
    ),
    ...videos.flatMap((item) =>
      localized("/videos/" + item.slug, { lastModified: item.updatedAt, priority: 0.6 }),
    ),
    ...issues.flatMap((item) =>
      localized("/edicoes/" + item.slug, { lastModified: item.updatedAt, priority: 0.6 }),
    ),
    ...issues.flatMap((item) =>
      localized("/modo-revista/" + item.slug, { lastModified: item.updatedAt, priority: 0.6 }),
    ),
  ];
}
