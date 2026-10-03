import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FlipbookReader } from "@/components/FlipbookReader";
import { ShareButtons } from "@/components/ShareButtons";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-url";
import { getDictionary } from "@/lib/i18n/server";
import { alternatesFor } from "@/lib/i18n/seo";
import { localize } from "@/lib/i18n/localize";
import { localePath } from "@/lib/i18n/locales";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

async function getIssue(slug: string) {
  const issue = await prisma.issue.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      pages: { orderBy: { position: "asc" }, select: { url: true, altText: true } },
      _count: { select: { items: true } },
    },
  });
  if (issue) await localize([{ model: "issue", records: [issue] }]);
  return issue;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const issue = await getIssue(slug);
  if (!issue) return {};
  return {
    title: issue.title,
    description: issue.description ?? undefined,
    alternates: await alternatesFor("/edicoes/" + issue.slug),
    openGraph: {
      title: issue.title,
      description: issue.description ?? undefined,
      images: issue.coverImage ? [{ url: issue.coverImage }] : undefined,
    },
  };
}

export default async function IssueReaderPage({ params }: Params) {
  const { slug } = await params;
  const [issue, { locale }] = await Promise.all([getIssue(slug), getDictionary()]);
  if (!issue) notFound();

  const path = "/edicoes/" + issue.slug;
  const magazinePath = issue._count.items ? "/modo-revista/" + issue.slug : undefined;

  // Edicao sem paginas: as materias dela seguem no Modo Revista.
  if (!issue.pages.length) {
    if (magazinePath) redirect(localePath(magazinePath, locale));
    notFound();
  }

  return (
    <section className="hero-under-topbar bg-brand pb-12 text-white">
      <div className="container-wide pt-10 md:pt-14">
        <h1 className="text-center text-3xl font-bold md:text-4xl">{issue.title}</h1>
        <div className="mt-8">
          <FlipbookReader
            title={issue.title}
            shareUrl={SITE_URL + localePath(path, locale)}
            magazineHref={magazinePath}
            pages={issue.pages.map((page) => ({ url: page.url, alt: page.altText }))}
          />
        </div>
        <div className="mt-8 flex justify-center">
          <ShareButtons title={issue.title} path={path} tone="light" />
        </div>
      </div>
    </section>
  );
}
