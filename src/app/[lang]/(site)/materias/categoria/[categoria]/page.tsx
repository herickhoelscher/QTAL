import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { excerpt } from "@/lib/format";
import { localize } from "@/lib/i18n/localize";
import { fmt } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/server";
import { alternatesFor } from "@/lib/i18n/seo";

export const revalidate = 300;

type Params = { params: Promise<{ categoria: string }> };

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ where: { type: "ARTICLE" } });
  return categories.map((category) => ({ categoria: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { categoria } = await params;
  const category = await prisma.category.findFirst({
    where: { slug: categoria, type: "ARTICLE" },
  });
  if (!category) return {};
  const { t } = await getDictionary();
  await localize([{ model: "category", records: [category] }]);
  return {
    title: category.name,
    description: fmt(t.articles.categoryMetaDescription, { name: category.name }),
    alternates: await alternatesFor("/materias/categoria/" + category.slug),
  };
}

export default async function CategoryPage({ params }: Params) {
  const { categoria } = await params;
  const category = await prisma.category.findFirst({
    where: { slug: categoria, type: "ARTICLE" },
    include: {
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: [{ featuredRank: { sort: "asc", nulls: "last" } }, { publishedAt: "desc" }],
        include: { categories: true },
      },
    },
  });

  if (!category) notFound();

  const { t } = await getDictionary();
  await localize([
    { model: "article", records: category.articles },
    { model: "category", records: [category, ...category.articles.flatMap((a) => a.categories)] },
  ]);

  return (
    <>
      <PageHeader eyebrow={t.articles.categoryEyebrow} title={category.name} />
      <div className="bg-surface-alt">
        <Section wide>
        {category.articles.length ? (
          <div className="masonry-2">
            {category.articles.map((article, index) => (
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
                aspect={index % 3 === 0 ? "3/4" : "4/3"}
                headingLevel={2}
              />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState>{t.articles.emptyCategory}</EmptyState>
        )}
        </Section>
      </div>
    </>
  );
}
