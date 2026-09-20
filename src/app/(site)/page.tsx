import Link from "next/link";
import { HeroCarousel, type HeroSlide } from "@/components/HeroCarousel";
import { AdCard, ContentCard, PropertyCard, VideoCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { VideoFeedCallout } from "@/components/VideoFeedCallout";
import { SubscribeBlock } from "@/components/SubscribeBlock";
import { EmptyState, Section, SectionHeading } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getSettings, whatsappLink } from "@/lib/settings";
import { editionLabel, excerpt, formatDateLong } from "@/lib/format";

export const revalidate = 300;

export default async function HomePage() {
  const settings = await getSettings();

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
          include: { issue: { select: { title: true } } },
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
          include: { issue: { select: { title: true } } },
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
      include: { event: { select: { title: true } } },
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
              Nenhuma matéria publicada ainda. Publique a primeira em{" "}
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
              <p className="eyebrow text-white/60">Modo Revista</p>
              <p className="mt-1 font-display text-2xl italic">{latestIssue.title}</p>
            </div>
            <Link
              href={"/modo-revista/" + latestIssue.slug}
              className="eyebrow shrink-0 rounded-full bg-white px-6 py-3 text-ink transition-colors hover:bg-accent hover:text-white"
            >
              Folhear edição
            </Link>
          </div>
        </div>
      ) : null}

      <div className="bg-surface-alt">
        <Section wide>
          <SectionHeading
            eyebrow="Leitura"
            title="Últimas matérias"
            href="/materias"
            description="Arquitetura, mercado imobiliário e o cotidiano da região, apurados com tempo de revista e publicados no ritmo de portal."
          />
          {articles.length ? (
            <div className="masonry-2">
              {articles.map((article, index) => (
                <Reveal key={article.id} index={index}>
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
              ))}
              {/* Publieditorial identificado, no padrao das duas referencias. */}
              <Reveal index={3}>
                <AdCard advertiser="Seu anúncio aqui" />
              </Reveal>
            </div>
          ) : (
            <EmptyState>Nenhuma matéria publicada.</EmptyState>
          )}
        </Section>
      </div>

      <div>
        <Section wide>
          <SectionHeading
            eyebrow="Agenda"
            title="Eventos"
            href="/eventos"
            description="A cobertura fotográfica das noites que movimentam a cidade — cada evento com galeria completa e os vídeos da noite."
          />
          {events.length ? (
            <div className="masonry-2">
              {events.map((event, index) => (
                <Reveal key={event.id} index={index}>
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
              ))}
            </div>
          ) : (
            <EmptyState>Nenhum evento publicado.</EmptyState>
          )}
        </Section>
      </div>

      <div className="bg-surface-alt">
        <Section wide>
          <SectionHeading
            eyebrow="Assista"
            title="Vídeos em destaque"
            href="/videos"
            description="Coberturas, entrevistas e bastidores. Toque em qualquer capa para entrar no feed e rolar de um vídeo para o outro, sem sair do site."
          />
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
                      provider={video.provider === "YOUTUBE" ? "YouTube" : "Instagram"}
                      eventTitle={video.event?.title}
                    />
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <EmptyState>Nenhum vídeo publicado.</EmptyState>
          )}
        </Section>
      </div>

      <div>
        <Section wide>
          <SectionHeading
            eyebrow="Morar"
            title="Imóveis em destaque"
            href="/imoveis"
            description="Uma seleção do que está à venda na região, com ficha técnica completa e contato direto pelo WhatsApp."
          />
          {properties.length ? (
            <div className="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property, index) => (
                <Reveal key={property.id} index={index}>
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
              ))}
            </div>
          ) : (
            <EmptyState>Nenhum imóvel publicado.</EmptyState>
          )}
        </Section>
      </div>

      <SubscribeBlock href={whatsappLink(settings.whatsappNumber, settings.whatsappMessage)} />

      {events[0] ? (
        <p className="sr-only">Próximo evento em {formatDateLong(events[0].date)}.</p>
      ) : null}
    </>
  );
}
