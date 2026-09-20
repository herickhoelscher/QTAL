import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MagazineReader, type MagazinePage } from "@/components/MagazineReader";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";

export const revalidate = 300;

type Params = { params: Promise<{ edicao: string }> };

async function getIssue(slug: string) {
  return prisma.issue.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: { article: { include: { categories: true } } },
      },
    },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { edicao } = await params;
  const issue = await getIssue(edicao);
  if (!issue) return {};
  return {
    title: issue.title + " · Modo Revista",
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
