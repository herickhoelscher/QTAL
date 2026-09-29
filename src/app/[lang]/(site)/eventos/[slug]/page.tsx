import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { VideoCard } from "@/components/cards";
import { PhotoGallery } from "@/components/PhotoGallery";
import { ShareButtons } from "@/components/ShareButtons";
import { CategoryBadge, Section, SectionHeading } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { excerpt, formatDateLong } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitize";
import { providerLabel } from "@/lib/video";
import { getDictionary } from "@/lib/i18n/server";
import { alternatesFor } from "@/lib/i18n/seo";
import { localize } from "@/lib/i18n/localize";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

async function getEvent(slug: string) {
  return prisma.event.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      categories: true,
      media: { orderBy: [{ album: "asc" }, { position: "asc" }] },
      videos: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};
  await localize([{ model: "event", records: [event] }]);
  const description = event.description ? excerpt(event.description) : undefined;
  return {
    title: event.title,
    description,
    alternates: await alternatesFor("/eventos/" + event.slug),
    openGraph: {
      type: "article",
      title: event.title,
      description,
      images: event.coverImage ? [{ url: event.coverImage }] : undefined,
    },
  };
}

export default async function EventPage({ params }: Params) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const { locale, t } = await getDictionary();
  await localize([
    { model: "event", records: [event] },
    { model: "category", records: event.categories },
    { model: "video", records: event.videos },
  ]);

  // Fotos agrupadas nos blocos/albuns definidos pelo admin.
  const albums = new Map<string, typeof event.media>();
  for (const media of event.media) {
    const key = media.album ?? "";
    const list = albums.get(key) ?? [];
    list.push(media);
    albums.set(key, list);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.date.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    location: event.location
      ? { "@type": "Place", name: event.location, address: event.region ?? undefined }
      : undefined,
    image: event.coverImage ? [event.coverImage] : undefined,
    description: event.description ? excerpt(event.description, 300) : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-line bg-surface-alt">
        <div className="container-portal py-14 md:py-20">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {event.categories.map((category) => (
              <CategoryBadge key={category.id} name={category.name} tone="brand" />
            ))}
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.15] md:text-6xl">
            {event.title}
          </h1>
          <p className="mt-6 text-sm text-muted">
            {formatDateLong(event.date, locale)}
            {event.location ? " · " + event.location : ""}
            {event.region ? " · " + event.region : ""}
          </p>
        </div>
      </header>

      {event.coverImage ? (
        <figure className="relative aspect-[16/9] w-full bg-surface-alt">
          <Image
            src={event.coverImage}
            alt={event.coverAlt ?? event.title}
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover"
          />
        </figure>
      ) : null}

      {event.description ? (
        <Section className="max-w-3xl">
          <div
            className="prose-editorial"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
          />
          <div className="mt-10 border-t border-line pt-6">
            <ShareButtons title={event.title} path={"/eventos/" + event.slug} />
          </div>
        </Section>
      ) : null}

      {event.media.length ? (
        <Section>
          <SectionHeading title={t.events.gallery} />
          {[...albums.entries()].map(([album, items]) => (
            <div key={album || "geral"} className="mb-12 last:mb-0">
              {album ? <p className="eyebrow mb-4 text-brand">{album}</p> : null}
              <PhotoGallery photos={items} fallbackAlt={event.title} />
            </div>
          ))}
        </Section>
      ) : null}

      {event.videos.length ? (
        <div className="bg-surface-alt">
          <Section>
            <SectionHeading title={t.events.videos} href="/videos" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {event.videos.map((video) => (
                <VideoCard
                  key={video.id}
                  href={"/videos/" + video.slug}
                  title={video.title}
                  embedId={video.embedId}
                  customThumbnail={video.customThumbnail}
                  vertical={video.vertical}
                  provider={providerLabel(video.provider)}
                />
              ))}
            </div>
          </Section>
        </div>
      ) : null}
    </>
  );
}
