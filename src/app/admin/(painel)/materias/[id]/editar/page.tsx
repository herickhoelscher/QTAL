import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

/** Formato aceito por <input type="datetime-local">. */
function toLocalInput(date: Date | null): string {
  if (!date) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: { categories: true, gallery: { orderBy: { position: "asc" } } },
    }),
    prisma.category.findMany({ where: { type: "ARTICLE" }, orderBy: { name: "asc" } }),
  ]);

  if (!article) notFound();

  return (
    <>
      <AdminHeading title="Editar matéria" description={article.title} />
      <ArticleForm
        categories={categories}
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          subtitle: article.subtitle,
          body: article.body,
          coverImage: article.coverImage,
          coverAlt: article.coverAlt,
          region: article.region,
          status: article.status,
          featured: article.featured,
          publishedAt: toLocalInput(article.publishedAt),
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          categoryIds: article.categories.map((category) => category.id),
          gallery: article.gallery.map((media) => ({
            url: media.url,
            altText: media.altText,
          })),
        }}
      />
    </>
  );
}
