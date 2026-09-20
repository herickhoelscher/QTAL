import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoFeed, type FeedVideo } from "@/components/VideoFeed";
import { prisma } from "@/lib/prisma";
import { thumbnailUrl, watchUrl } from "@/lib/video";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Feed de vídeos",
  description: "Assista aos vídeos em sequência, um após o outro.",
};

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
    include: { event: { select: { title: true, slug: true } } },
  });

  if (!videos.length) notFound();

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
        &larr; Sair do feed
      </Link>
      <VideoFeed videos={items} startIndex={startIndex} />
    </>
  );
}
