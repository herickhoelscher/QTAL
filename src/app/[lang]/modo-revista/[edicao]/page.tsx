import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MagazineReader, type MagazinePage } from "@/components/MagazineReader";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";
import { getDictionary } from "@/lib/i18n/server";
import { alternatesFor } from "@/lib/i18n/seo";
import { localize } from "@/lib/i18n/localize";

export const revalidate = 300;

type Params = { params: Promise<{ edicao: string }> };

async function getIssue(slug: string) {
  const issue = await prisma.issue.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: { article: { include: { categories: true } } },
      },
    },
  });
  if (issue) {
    const articles = issue.items.map((item) => item.article);
    await localize([
      { model: "issue", records: [issue] },
      { model: "article", records: articles },
      { model: "category", records: articles.flatMap((article) => article.categories) },
    ]);
  }
  return issue;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { edicao } = await params;
  const issue = await getIssue(edicao);
  if (!issue) return {};
  const { t } = await getDictionary();
  return {
    title: issue.title + " · " + t.magazine.label,
    alternates: await alternatesFor("/modo-revista/" + issue.slug),
    description: issue.description ?? undefined,
    openGraph: {
      title: issue.title,
      description: issue.description ?? undefined,
      images: issue.coverImage ? [{ url: issue.coverImage }] : undefined,
    },
  };
}

export default async function MagazinePageRoute({ params }: Params) {
  const { edicao } = await params;
  const issue = await getIssue(edicao);
  if (!issue) notFound();

  const pages: MagazinePage[] = issue.items
    .filter((item) => item.article.status === "PUBLISHED")
    .map((item) => ({
      slug: item.article.slug,
      title: item.article.title,
      subtitle: item.article.subtitle,
      category: item.article.categories[0]?.name ?? null,
      image: item.article.coverImage,
      html: sanitizeHtml(item.article.body),
    }));

  if (!pages.length) notFound();

  return <MagazineReader issueTitle={issue.title} pages={pages} />;
}
