import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

import { SITE_URL } from "@/lib/site-url";

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

  const staticRoutes = ["", "/materias", "/eventos", "/imoveis", "/videos", "/assine", "/sobre"];

  return [
    ...staticRoutes.map((route) => ({
      url: SITE_URL + route,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...categories.map((category) => ({
      url: SITE_URL + "/materias/categoria/" + category.slug,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...articles.map((item) => ({
      url: SITE_URL + "/materias/" + item.slug,
      lastModified: item.updatedAt,
      priority: 0.7,
    })),
    ...events.map((item) => ({
      url: SITE_URL + "/eventos/" + item.slug,
      lastModified: item.updatedAt,
      priority: 0.7,
    })),
    ...properties.map((item) => ({
      url: SITE_URL + "/imoveis/" + item.slug,
      lastModified: item.updatedAt,
      priority: 0.7,
    })),
    ...videos.map((item) => ({
      url: SITE_URL + "/videos/" + item.slug,
      lastModified: item.updatedAt,
      priority: 0.6,
    })),
    ...issues.map((item) => ({
      url: SITE_URL + "/modo-revista/" + item.slug,
      lastModified: item.updatedAt,
      priority: 0.6,
    })),
  ];
}
