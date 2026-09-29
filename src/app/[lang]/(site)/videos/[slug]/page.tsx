import type { Metadata } from "next";
import Link from "@/components/LocalizedLink";
import { notFound } from "next/navigation";
import { LazyEmbed } from "@/components/LazyEmbed";
import { ShareButtons } from "@/components/ShareButtons";
import { VideoCard } from "@/components/cards";
import { Section, SectionHeading } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { excerpt } from "@/lib/format";
import { embedUrl, providerLabel, thumbnailUrl, watchUrl } from "@/lib/video";
import { fmt } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/server";
import { alternatesFor } from "@/lib/i18n/seo";
import { localize } from "@/lib/i18n/localize";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

async function getVideo(slug: string) {
  return prisma.video.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { event: { select: { id: true, title: true, slug: true } }, categories: true },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideo(slug);
  if (!video) return {};
  await localize([{ model: "video", records: [video] }]);
  const description = video.description ? excerpt(video.description) : undefined;
  const thumbnail = thumbnailUrl(video.provider, video.embedId, video.customThumbnail);
  return {
    title: video.title,
    description,
    alternates: await alternatesFor("/videos/" + video.slug),
    openGraph: {
      type: "video.other",
      title: video.title,
      description,
      images: thumbnail ? [{ url: thumbnail }] : undefined,
    },
  };
}

export default async function VideoPage({ params }: Params) {
  const { slug } = await params;
  const video = await getVideo(slug);
  if (!video) notFound();

  const others = await prisma.video.findMany({
    where: { status: "PUBLISHED", id: { not: video.id } },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { event: { select: { id: true, title: true } } },
  });

  const { t } = await getDictionary();
  await localize([
    { model: "video", records: [video, ...others] },
    { model: "event", records: [video.event, ...others.map((item) => item.event)] },
  ]);

  const thumbnail = thumbnailUrl(video.provider, video.embedId, video.customThumbnail);

  return (
    <>
      {/* Cabecalho em cor de marca, no espirito da pagina de video da DIFE. */}
      <div className="bg-brand text-white">
        <div className="container-portal py-12 md:py-16">
          <p className="eyebrow text-white/70">{providerLabel(video.provider)}</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl leading-tight italic md:text-6xl">
            {video.title}
          </h1>
          {video.event ? (
            <p className="mt-4 text-white/85">
              {t.videos.recordedAt}{" "}
              <Link href={"/eventos/" + video.event.slug} className="underline">
                {video.event.title}
              </Link>
            </p>
          ) : null}

          {/* Em retrato o player e estreito: sem limitar a largura, um 9:16
              esticado na coluna principal empurraria a descricao para fora da
              primeira tela. */}
          <div
            className={
              "mt-8 grid gap-8 " +
              (video.vertical ? "lg:grid-cols-[380px_1fr]" : "lg:grid-cols-[1fr_280px]")
            }
          >
            <div className="overflow-hidden border border-white/20">
              <LazyEmbed
                embedSrc={embedUrl(video.provider, video.embedId)}
                embedId={video.embedId}
                vertical={video.vertical}
                thumbnail={thumbnail}
                title={video.title}
              />
            </div>

            <div>
              {video.description ? (
                <p className="text-white/85">{video.description}</p>
              ) : null}
              <a
                href={watchUrl(video.provider, video.embedId, video.externalUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow mt-6 inline-block rounded-full border border-white/70 px-6 py-3 transition-colors hover:bg-white hover:text-brand"
              >
                {fmt(t.common.watchOn, { provider: providerLabel(video.provider) })}
              </a>
              <div className="mt-6">
                <ShareButtons title={video.title} path={"/videos/" + video.slug} tone="light" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {others.length ? (
        <Section>
          <SectionHeading title={t.videos.more} href="/videos" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <VideoCard
                key={item.id}
                href={"/videos/" + item.slug}
                title={item.title}
                embedId={item.embedId}
                customThumbnail={item.customThumbnail}
                vertical={item.vertical}
                provider={providerLabel(item.provider)}
                eventTitle={item.event?.title}
              />
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
