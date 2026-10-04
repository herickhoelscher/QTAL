import Link from "@/components/LocalizedLink";
import { HeroCarousel, type HeroSlide } from "@/components/HeroCarousel";
import { IssuesShelf } from "@/components/IssuesShelf";
import { AdCard, ContentCard, PropertyCard, VideoCard } from "@/components/cards";
import { ExpandableSection } from "@/components/ExpandableSection";
import { Reveal } from "@/components/Reveal";
import { VideoFeedCallout } from "@/components/VideoFeedCallout";
import { SubscribeBlock } from "@/components/SubscribeBlock";
import { EmptyState, Section, SectionHeading } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { heroItem, loadHeroSlides } from "@/lib/hero";
import { getSettings, whatsappLink } from "@/lib/settings";
import { coverText } from "@/lib/issue-cover";
import { editionLabel, excerpt, formatDateLong } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { localize, localizedSettingsTexts } from "@/lib/i18n/localize";
import { alternatesFor } from "@/lib/i18n/seo";
import { fmt } from "@/lib/i18n/locales";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: await alternatesFor("/") };
}

export default async function HomePage() {
  const [settings, { locale, t }] = await Promise.all([getSettings(), getDictionary()]);

  // Destaques escolhidos no painel abrem cada bloco, na ordem deles; o resto
  // do bloco e completado com os mais recentes.
  const featuredFirst = { featuredRank: { sort: "asc", nulls: "last" } } as const;

  const [heroRows, articles, events, videos, properties, latestIssue] = await Promise.all([
    loadHeroSlides(),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [featuredFirst, { publishedAt: "desc" }],
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
      orderBy: [featuredFirst, { date: "desc" }],
      take: 6,
      include: { categories: true },
    }),
    prisma.video.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [featuredFirst, { publishedAt: "desc" }],
      take: 6,
      include: { event: { select: { id: true, title: true } } },
    }),
    prisma.property.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [featuredFirst, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.issue.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  // Faixa "Edicoes anteriores": as publicadas, destaques primeiro.
  const pastIssues = await prisma.issue.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [featuredFirst, { publishedAt: "desc" }],
    take: 12,
  });

  // Slides de rascunho ficam no painel, mas nao no site.
  const heroLive = heroRows.filter((row) => heroItem(row)?.status === "PUBLISHED");

  await localize([
    { model: "article", records: [...articles, ...heroLive.map((row) => row.article)] },
    { model: "category", records: [...articles, ...events].flatMap((item) => item.categories) },
    {
      model: "issue",
      records: [
        ...articles.flatMap((a) => a.issueItems.map((i) => i.issue)),
        latestIssue,
        ...pastIssues,
        ...heroLive.map((row) => row.issue),
      ],
    },
    {
      model: "event",
      records: [...events, ...videos.map((video) => video.event), ...heroLive.map((row) => row.event)],
    },
    { model: "video", records: [...videos, ...heroLive.map((row) => row.video)] },
    { model: "property", records: [...properties, ...heroLive.map((row) => row.property)] },
  ]);

  const settingsTexts = await localizedSettingsTexts(settings);

  const chosen = heroLive.map(heroItem).filter((item) => item !== null);
  // Carrossel vazio no painel: as 3 materias mais recentes seguram o topo.
  const slides: HeroSlide[] = chosen.length
    ? chosen.map((item) => ({
        title: item.title,
        subtitle: item.subtitle,
        href: item.href,
        image: item.image,
        category: t.hero.types[item.type],
      }))
    : articles.slice(0, 3).map((article) => ({
        title: article.title,
        subtitle: article.subtitle ?? excerpt(article.body, 140),
        href: "/materias/" + article.slug,
        image: article.coverImage,
        category: article.categories[0]?.name ?? null,
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
              href={"/edicoes/" + latestIssue.slug}
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
                      aspect={article.featuredRank !== null ? "3/4" : "4/3"}
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
                      neighborhood={property.neighborhood}
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

      {pastIssues.length ? (
        <IssuesShelf
          siteName={settings.siteName}
          logoUrl={settings.clientLogoUrl}
          issues={pastIssues.map((issue) => ({
            slug: issue.slug,
            title: issue.title,
            cover: issue.coverImage,
            coverText: coverText(issue, settings),
          }))}
        />
      ) : null}

      <SubscribeBlock href={whatsappLink(settings.whatsappNumber, settingsTexts.whatsappMessage)} />

      {events[0] ? (
        <p className="sr-only">
          {fmt(t.home.nextEvent, { date: formatDateLong(events[0].date, locale) })}
        </p>
      ) : null}
    </>
  );
}
