import type { Metadata } from "next";
import { VideoCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { VideoFeedCallout } from "@/components/VideoFeedCallout";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { providerLabel } from "@/lib/video";
import { getDictionary } from "@/lib/i18n/server";
import { alternatesFor } from "@/lib/i18n/seo";
import { localize } from "@/lib/i18n/localize";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.nav.videos,
    description: t.videos.metaDescription,
    alternates: await alternatesFor("/videos"),
  };
}

export default async function VideosPage() {
  // Videos cadastrados dentro de um evento aparecem aqui automaticamente:
  // e a mesma entidade Video, apenas com eventId preenchido.
  const videos = await prisma.video.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    include: { event: { select: { id: true, title: true } } },
  });

  const { t } = await getDictionary();
  await localize([
    { model: "video", records: videos },
    { model: "event", records: videos.map((video) => video.event) },
  ]);

  return (
    <>
      <PageHeader
        eyebrow={t.videos.eyebrow}
        title={t.nav.videos}
        description={t.videos.metaDescription}
      />

      <Section wide>
        {videos.length ? (
          <>
            <Reveal>
              <VideoFeedCallout />
            </Reveal>

            <div className="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video, index) => (
                <Reveal key={video.id} index={index}>
                  <VideoCard
                    href={"/videos/" + video.slug}
                    feedHref={"/videos/feed?v=" + video.slug}
                    title={video.title}
                    embedId={video.embedId}
                    customThumbnail={video.customThumbnail}
                    vertical={video.vertical}
                    provider={providerLabel(video.provider)}
                    eventTitle={video.event?.title}
                    headingLevel={2}
                    priority={index < 3}
                  />
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          <EmptyState>{t.videos.empty}</EmptyState>
        )}
      </Section>
    </>
  );
}
