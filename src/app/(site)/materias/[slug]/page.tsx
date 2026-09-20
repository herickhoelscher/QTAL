import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ContentCard, VideoCard } from "@/components/cards";
import { ShareButtons } from "@/components/ShareButtons";
import { ViewCounter } from "@/components/ViewCounter";
import { CategoryBadge, Section, SectionHeading } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { providerLabel } from "@/lib/video";
import { excerpt, formatDateLong } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitize";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

async function getArticle(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      categories: true,
      author: { select: { name: true } },
      gallery: { orderBy: { position: "asc" } },
      videos: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const description = article.metaDescription ?? article.subtitle ?? excerpt(article.body);

  return {
    title: article.metaTitle ?? article.title,
    description,
    alternates: { canonical: "/materias/" + article.slug },
    openGraph: {
      type: "article",
      title: article.metaTitle ?? article.title,
      description,
      publishedTime: (article.publishedAt ?? article.createdAt).toISOString(),
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const categoryIds = article.categories.map((category) => category.id);
  const related = categoryIds.length
    ? await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          id: { not: article.id },
          categories: { some: { id: { in: categoryIds } } },
        },
        orderBy: { publishedAt: "desc" },
        take: 3,
        include: { categories: true },
      })
    : [];

  const publishedAt = article.publishedAt ?? article.createdAt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription ?? article.subtitle ?? excerpt(article.body),
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: article.author ? { "@type": "Person", name: article.author.name } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewCounter slug={article.slug} />

      <header className="border-b border-line bg-surface-alt">
        <div className="container-portal py-14 md:py-20">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {article.categories.map((category) => (
              <CategoryBadge
                key={category.id}
                name={category.name}
                href={"/materias/categoria/" + category.slug}
                tone="brand"
              />
            ))}
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.15] md:text-6xl">
            {article.title}
          </h1>
          {article.subtitle ? (
            <p className="mt-5 max-w-2xl font-display text-xl leading-relaxed text-muted italic md:text-2xl">
              {article.subtitle}
            </p>
          ) : null}
          <p className="mt-6 text-sm text-muted">
            {formatDateLong(publishedAt)}
            {article.author ? " · por " + article.author.name : ""}
          </p>
        </div>
      </header>

      {article.coverImage ? (
        <figure className="relative aspect-[16/9] w-full bg-surface-alt">
          <Image
            src={article.coverImage}
            alt={article.coverAlt ?? article.title}
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover"
          />
        </figure>
      ) : null}

      <Section className="max-w-3xl">
        <div
          className="prose-editorial"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.body) }}
        />

        {article.gallery.length ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {article.gallery.map((media) => (
              <figure key={media.id} className="relative aspect-[4/3] bg-surface-alt">
                <Image
                  src={media.url}
                  alt={media.altText ?? ""}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </figure>
            ))}
          </div>
        ) : null}

        {/* Video da materia: mesmo registro de /videos, so ancorado aqui. */}
        {article.videos.length ? (
          <div className="mt-12">
            <h2 className="eyebrow mb-4 text-muted">
              {article.videos.length > 1 ? "Vídeos desta matéria" : "Vídeo desta matéria"}
            </h2>
            <div className="grid items-start gap-6 sm:grid-cols-2">
              {article.videos.map((video) => (
                <VideoCard
                  key={video.id}
                  href={"/videos/" + video.slug}
                  feedHref={"/videos/feed?v=" + video.slug}
                  title={video.title}
                  embedId={video.embedId}
                  customThumbnail={video.customThumbnail}
                  vertical={video.vertical}
                  provider={providerLabel(video.provider)}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12 border-t border-line pt-6">
          <p className="eyebrow mb-3 text-muted">Compartilhar</p>
          <ShareButtons title={article.title} path={"/materias/" + article.slug} />
        </div>
      </Section>

      {related.length ? (
        <div className="bg-surface-alt">
          <Section>
            <SectionHeading title="Conteúdo relacionado" href="/materias" />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ContentCard
                  key={item.id}
                  href={"/materias/" + item.slug}
                  title={item.title}
                  excerpt={item.subtitle ?? excerpt(item.body, 110)}
                  image={item.coverImage}
                  imageAlt={item.coverAlt}
                  categories={item.categories}
                  categoryHrefPrefix="/materias/categoria/"
                  date={item.publishedAt ?? item.createdAt}
                />
              ))}
            </div>
          </Section>
        </div>
      ) : null}
    </>
  );
}
