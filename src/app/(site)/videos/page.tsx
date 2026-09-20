import type { Metadata } from "next";
import { VideoCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { VideoFeedCallout } from "@/components/VideoFeedCallout";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { providerLabel } from "@/lib/video";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Vídeos",
  description: "Coberturas, entrevistas e bastidores em vídeo.",
};

export default async function VideosPage() {
  // Videos cadastrados dentro de um evento aparecem aqui automaticamente:
  // e a mesma entidade Video, apenas com eventId preenchido.
  const videos = await prisma.video.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    include: { event: { select: { title: true } } },
  });

  return (
    <>
      <PageHeader
        eyebrow="Assista"
        title="Vídeos"
        description="Coberturas, entrevistas e bastidores em vídeo."
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
          <EmptyState>Nenhum vídeo publicado.</EmptyState>
        )}
      </Section>
    </>
  );
}
