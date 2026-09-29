import type { Metadata } from "next";
import Link from "@/components/LocalizedLink";
import { notFound } from "next/navigation";
import { VideoFeed, type FeedVideo } from "@/components/VideoFeed";
import { prisma } from "@/lib/prisma";
import { thumbnailUrl, watchUrl } from "@/lib/video";
import { getDictionary } from "@/lib/i18n/server";
import { alternatesFor } from "@/lib/i18n/seo";
import { localize } from "@/lib/i18n/localize";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.videos.feedTitle,
    description: t.videos.feedDescription,
    alternates: await alternatesFor("/videos/feed"),
  };
}

type Props = { searchParams: Promise<{ v?: string }> };

/**
 * Fica fora do grupo (site) de propósito: o feed ocupa a tela inteira, sem
 * header, barra de dados nem rodapé.
 */
export default async function VideoFeedPage({ searchParams }: Props) {
  const { v } = await searchParams;

  const videos = await prisma.video.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    include: { event: { select: { id: true, title: true, slug: true } } },
  });

  if (!videos.length) notFound();

  const { t } = await getDictionary();
  await localize([
    { model: "video", records: videos },
    { model: "event", records: videos.map((video) => video.event) },
  ]);

  const items: FeedVideo[] = videos.map((video) => ({
    slug: video.slug,
    title: video.title,
    description: video.description,
    provider: video.provider,
    embedId: video.embedId,
    externalUrl: watchUrl(video.provider, video.embedId, video.externalUrl),
    thumbnail: thumbnailUrl(video.provider, video.embedId, video.customThumbnail),
    vertical: video.vertical,
    eventTitle: video.event?.title ?? null,
    eventSlug: video.event?.slug ?? null,
  }));

  const startIndex = Math.max(
    0,
    items.findIndex((item) => item.slug === v),
  );

  return (
    <>
      <Link
        href="/videos"
        className="eyebrow fixed top-4 left-4 z-20 rounded-full bg-black/50 px-4 py-2 text-white backdrop-blur transition-colors hover:bg-black/70"
      >
        &larr; {t.videos.exitFeed}
      </Link>
      <VideoFeed videos={items} startIndex={startIndex} />
    </>
  );
}
