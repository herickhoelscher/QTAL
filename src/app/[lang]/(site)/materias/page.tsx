import type { Metadata } from "next";
import { Suspense } from "react";
import { AdCard, ContentCard } from "@/components/cards";
import { CategoryTabs, type TabItem } from "@/components/CategoryTabs";
import { Reveal } from "@/components/Reveal";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { editionLabel, excerpt } from "@/lib/format";
import { localize } from "@/lib/i18n/localize";
import { getDictionary } from "@/lib/i18n/server";
import { alternatesFor } from "@/lib/i18n/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.nav.articles,
    description: t.articles.metaDescription,
    alternates: await alternatesFor("/materias"),
  };
}

export default async function ArticlesPage() {
  const [articles, categories, { t }] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: {
        categories: true,
        issueItems: {
          where: { issue: { status: "PUBLISHED" } },
          take: 1,
          include: { issue: { select: { id: true, title: true } } },
        },
      },
    }),
    prisma.category.findMany({ where: { type: "ARTICLE" }, orderBy: { name: "asc" } }),
    getDictionary(),
  ]);

  await localize([
    { model: "article", records: articles },
    { model: "category", records: [...categories, ...articles.flatMap((a) => a.categories)] },
    { model: "issue", records: articles.flatMap((a) => a.issueItems.map((i) => i.issue)) },
  ]);

  const items: TabItem[] = articles.map((article, index) => ({
    id: article.id,
    slugs: article.categories.map((category) => category.slug),
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
            article.issueItems[0] ? editionLabel(article.issueItems[0].issue.title) : null
          }
          aspect={index % 3 === 0 ? "3/4" : "4/3"}
          headingLevel={2}
          priority={index < 3}
        />
      </Reveal>
    ),
  }));

  return (
    <>
      <PageHeader
        eyebrow={t.articles.eyebrow}
        title={t.nav.articles}
        description={t.articles.metaDescription}
      />

      <div className="bg-surface-alt">
        <Section wide>
          {articles.length ? (
            // As abas leem ?categoria= no navegador, entao a pagina estatica sai
            // com este fallback: a lista completa, visivel para buscadores e
            // para quem abre antes do JavaScript carregar.
            <Suspense
              fallback={
                <div className="masonry-2">
                  {items.map((item) => (
                    <div key={item.id}>{item.node}</div>
                  ))}
                </div>
              }
            >
              <CategoryTabs
                categories={categories.map((category) => ({
                  slug: category.slug,
                  name: category.name,
                }))}
                items={items}
                extra={
                  <Reveal index={4}>
                    <AdCard advertiser={t.cards.adPlaceholder} />
                  </Reveal>
                }
              />
            </Suspense>
          ) : (
            <EmptyState>{t.articles.empty}</EmptyState>
          )}
        </Section>
      </div>
    </>
  );
}
