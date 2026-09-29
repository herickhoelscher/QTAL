import Link from "@/components/LocalizedLink";
import { HeroCarousel, type HeroSlide } from "@/components/HeroCarousel";
import { AdCard, ContentCard, PropertyCard, VideoCard } from "@/components/cards";
import { ExpandableSection } from "@/components/ExpandableSection";
import { Reveal } from "@/components/Reveal";
import { VideoFeedCallout } from "@/components/VideoFeedCallout";
import { SubscribeBlock } from "@/components/SubscribeBlock";
import { EmptyState, Section, SectionHeading } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getSettings, whatsappLink } from "@/lib/settings";
import { editionLabel, excerpt, formatDateLong } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { localize } from "@/lib/i18n/localize";
import { alternatesFor } from "@/lib/i18n/seo";
import { fmt } from "@/lib/i18n/locales";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: await alternatesFor("/") };
}

export default async function HomePage() {
  const [settings, { locale, t }] = await Promise.all([getSettings(), getDictionary()]);

  const [featured, articles, events, videos, properties, latestIssue] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", featured: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
      include: {
        categories: true,
        issueItems: {
          where: { issue: { status: "PUBLISHED" } },
          take: 1,
          include: { issue: { select: { id: true, title: true } } },
        },
      },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 9,
      include: {
        categories: true,
        issueItems: {
          where: { issue: { status: "PUBLISHED" } },
          take: 1,
          include: { issue: { select: { id: true, title: true } } },
        },
      },
    }),
    prisma.event.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { date: "desc" },
      take: 6,
      include: { categories: true },
    }),
    prisma.video.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 6,
      include: { event: { select: { id: true, title: true } } },
    }),
    prisma.property.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.issue.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const allArticles = [...featured, ...articles];
  await localize([
    { model: "article", records: allArticles },
    { model: "category", records: [...allArticles, ...events].flatMap((item) => item.categories) },
    { model: "issue", records: [...allArticles.flatMap((a) => a.issueItems.map((i) => i.issue)), latestIssue] },
    { model: "event", records: [...events, ...videos.map((video) => video.event)] },
    { model: "video", records: videos },
    { model: "property", records: properties },
  ]);

  const heroSource = featured.length ? featured : articles.slice(0, 3);
  const slides: HeroSlide[] = heroSource.map((article) => ({
    title: article.title,
    subtitle: article.subtitle ?? excerpt(article.body, 140),
    href: "/materias/" + article.slug,
    image: article.coverImage,
    // A tarja repete o padrao da referencia: a edicao vem antes da editoria.
    category: article.issueItems?.[0]
      ? editionLabel(article.issueItems[0].issue.title)
      : (article.categories[0]?.name ?? null),
  }));

  return (
    <>
      {slides.length ? (
        <HeroCarousel slides={slides} />
      ) : (
        <div className="hero-under-topbar bg-surface-alt">
          <Section>
            <EmptyState>
              {t.home.empty}{" "}
              <Link href="/admin" className="text-brand underline">
                /admin
              </Link>
              .
            </EmptyState>
          </Section>
        </div>
      )}

      {latestIssue ? (
        <div className="border-b border-line bg-ink text-white">
          <div className="container-portal flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-white/60">{t.home.magazineMode}</p>
              <p className="mt-1 font-display text-2xl italic">{latestIssue.title}</p>
            </div>
            <Link
              href={"/modo-revista/" + latestIssue.slug}
              className="eyebrow shrink-0 rounded-full bg-white px-6 py-3 text-ink transition-colors hover:bg-accent hover:text-white"
            >
              {t.home.browseIssue}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="bg-surface-alt">
        <Section wide>
          <SectionHeading
            eyebrow={t.home.articlesEyebrow}
            title={t.home.articlesTitle}
            href="/materias"
            description={t.home.articlesDescription}
          />
          {articles.length ? (
            <ExpandableSection
              className="masonry-2"
              items={articles.map((article, index) => ({
                id: article.id,
                node: (
                  <Reveal index={index}>
                    <ContentCard
                      href={"/materias/" + article.slug}
                      title={article.title}
                      excerpt={article.subtitle ?? excerpt(article.body)}
                      image={article.coverImage}
                      imageAlt={article.coverAlt}
                      categories={article.categories}
                      categoryHrefPrefix="/materias/categoria/"
                      date={article.publishedAt ?? article.createdAt}
                      edition={
                        article.issueItems[0]
                          ? editionLabel(article.issueItems[0].issue.title)
                          : null
                      }
                      aspect={article.featured ? "3/4" : "4/3"}
                    />
                  </Reveal>
                ),
              }))}
              /* Publieditorial identificado, no padrao das duas referencias. */
              extra={
                <Reveal index={3}>
                  <AdCard advertiser={t.cards.adPlaceholder} />
                </Reveal>
              }
            />
          ) : (
            <EmptyState>{t.home.articlesEmpty}</EmptyState>
          )}
        </Section>
      </div>

      <div>
        <Section wide>
          <SectionHeading
            eyebrow={t.home.eventsEyebrow}
            title={t.home.eventsTitle}
            href="/eventos"
            description={t.home.eventsDescription}
          />
          {events.length ? (
            <ExpandableSection
              className="masonry-2"
              items={events.map((event, index) => ({
                id: event.id,
                node: (
                  <Reveal index={index}>
                    <ContentCard
                      href={"/eventos/" + event.slug}
                      title={event.title}
                      excerpt={event.description ? excerpt(event.description, 120) : null}
                      image={event.coverImage}
                      imageAlt={event.coverAlt}
                      categories={event.categories}
                      date={event.date}
                      relative={false}
                      meta={event.location ?? undefined}
                      aspect={index % 3 === 0 ? "3/4" : "4/3"}
                    />
                  </Reveal>
                ),
              }))}
            />
          ) : (
            <EmptyState>{t.home.eventsEmpty}</EmptyState>
          )}
        </Section>
      </div>

      <div className="bg-surface-alt">
        <Section wide>
          <SectionHeading
            eyebrow={t.home.videosEyebrow}
            title={t.home.videosTitle}
            href="/videos"
            description={t.home.videosDescription}
          />
          {videos.length ? (
            <>
              <Reveal>
                <VideoFeedCallout />
              </Reveal>
              <ExpandableSection
                className="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3"
                items={videos.map((video, index) => ({
                  id: video.id,
                  node: (
                    <Reveal index={index}>
                      <VideoCard
                        href={"/videos/" + video.slug}
                        feedHref={"/videos/feed?v=" + video.slug}
                        title={video.title}
                        embedId={video.embedId}
                        customThumbnail={video.customThumbnail}
                        vertical={video.vertical}
                        provider={video.provider === "YOUTUBE" ? "YouTube" : "Instagram"}
                        eventTitle={video.event?.title}
                      />
                    </Reveal>
                  ),
                }))}
              />
            </>
          ) : (
            <EmptyState>{t.home.videosEmpty}</EmptyState>
          )}
        </Section>
      </div>

      <div>
        <Section wide>
          <SectionHeading
            eyebrow={t.home.propertiesEyebrow}
            title={t.home.propertiesTitle}
            href="/imoveis"
            description={t.home.propertiesDescription}
          />
          {properties.length ? (
            <ExpandableSection
              className="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3"
              items={properties.map((property, index) => ({
                id: property.id,
                node: (
                  <Reveal index={index}>
                    <PropertyCard
                      href={"/imoveis/" + property.slug}
                      title={property.title}
                      image={property.coverImage}
                      city={property.city}
                      region={property.region}
                      type={property.type}
                      price={property.price ? Number(property.price) : null}
                      priceOnRequest={property.priceOnRequest}
                      area={property.area}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      garageSpots={property.garageSpots}
                    />
                  </Reveal>
                ),
              }))}
            />
          ) : (
            <EmptyState>{t.home.propertiesEmpty}</EmptyState>
          )}
        </Section>
      </div>

      <SubscribeBlock href={whatsappLink(settings.whatsappNumber, settings.whatsappMessage)} />

      {events[0] ? (
        <p className="sr-only">
          {fmt(t.home.nextEvent, { date: formatDateLong(events[0].date, locale) })}
        </p>
      ) : null}
    </>
  );
}
