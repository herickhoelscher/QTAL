import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { excerpt } from "@/lib/format";

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
  return {
    title: category.name,
    description: "Matérias publicadas na editoria " + category.name + ".",
  };
}

export default async function CategoryPage({ params }: Params) {
  const { categoria } = await params;
  const category = await prisma.category.findFirst({
    where: { slug: categoria, type: "ARTICLE" },
    include: {
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: { categories: true },
      },
    },
  });

  if (!category) notFound();

  return (
    <>
      <PageHeader eyebrow="Editoria" title={category.name} />
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
          <EmptyState>Ainda não há matérias nesta editoria.</EmptyState>
        )}
        </Section>
      </div>
    </>
  );
}
