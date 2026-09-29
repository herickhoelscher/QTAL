import type { Metadata } from "next";
import { Suspense } from "react";
import { AdCard, ContentCard } from "@/components/cards";
import { CategoryTabs, type TabItem } from "@/components/CategoryTabs";
import { Reveal } from "@/components/Reveal";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { editionLabel, excerpt } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Matérias",
  description: "Reportagens, colunas e bastidores publicados pela redação.",
};

export default async function ArticlesPage() {
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: {
        categories: true,
        issueItems: {
          where: { issue: { status: "PUBLISHED" } },
          take: 1,
          include: { issue: { select: { title: true } } },
        },
      },
    }),
    prisma.category.findMany({ where: { type: "ARTICLE" }, orderBy: { name: "asc" } }),
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
        eyebrow="Leitura"
        title="Matérias"
        description="Reportagens, colunas e bastidores publicados pela redação."
      />

      <div className="bg-surface-alt">
        <Section wide>
          {articles.length ? (
            <Suspense fallback={null}>
              <CategoryTabs
                categories={categories.map((category) => ({
                  slug: category.slug,
                  name: category.name,
                }))}
                items={items}
                extra={
                  <Reveal index={4}>
                    <AdCard advertiser="Seu anúncio aqui" />
                  </Reveal>
                }
              />
            </Suspense>
          ) : (
            <EmptyState>Nenhuma matéria publicada até agora.</EmptyState>
          )}
        </Section>
      </div>
    </>
  );
}
