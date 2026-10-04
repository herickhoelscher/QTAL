import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { FlipbookReader } from "@/components/FlipbookReader";
import { IssueCoverArt } from "@/components/IssueCover";
import { IssuesMenu, type MenuIssue } from "@/components/IssuesMenu";
import Link from "@/components/LocalizedLink";
import { ShareButtons } from "@/components/ShareButtons";
import { formatMonthYear } from "@/lib/format";
import { coverText, flipPages } from "@/lib/issue-cover";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
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

/** Todas as publicadas, da mais nova para a mais antiga: menu e vizinhas. */
async function getEditions() {
  const editions = await prisma.issue.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      coverTitle: true,
      coverSubtitle: true,
      publishedAt: true,
      pages: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
  });
  await localize([{ model: "issue", records: editions }]);
  return editions;
}

/** Capa de uma edicao vizinha, ao lado da revista: clique leva direto para ela. */
function NeighborIssue({
  issue,
  label,
  align,
}: {
  issue: MenuIssue;
  label: string;
  align: "left" | "right";
}) {
  return (
    <Link
      href={"/edicoes/" + issue.slug}
      className={"group block " + (align === "right" ? "text-right" : "")}
    >
      <span className="eyebrow block text-white/70 transition-colors group-hover:text-white">
        {align === "left" ? "← " + label : label + " →"}
      </span>
      <IssueCoverArt
        image={issue.image}
        text={issue.coverText}
        sizes="170px"
        className="mt-3 rounded-md shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/15 transition-transform duration-300 group-hover:-translate-y-1 group-hover:ring-white/60"
      />
      <span className="mt-3 block text-sm font-semibold leading-snug text-white/90 group-hover:text-white">
        {issue.title}
      </span>
      {issue.date ? (
        <span className="block text-xs text-white/60">{issue.date}</span>
      ) : null}
    </Link>
  );
}

export default async function IssueReaderPage({ params }: Params) {
  const { slug } = await params;
  const [issue, { locale, t }, settings, editions] = await Promise.all([
    getIssue(slug),
    getDictionary(),
    getSettings(),
    getEditions(),
  ]);
  if (!issue) notFound();

  const path = "/edicoes/" + issue.slug;
  const magazinePath = issue._count.items ? "/modo-revista/" + issue.slug : undefined;

  // Edicao sem paginas: as materias dela seguem no Modo Revista.
  if (!issue.pages.length) {
    if (magazinePath) redirect(localePath(magazinePath, locale));
    notFound();
  }

  const menu: MenuIssue[] = editions.map((edition) => ({
    slug: edition.slug,
    title: edition.title,
    image: edition.coverImage ?? edition.pages[0]?.url ?? null,
    coverText: coverText(edition, settings),
    date: edition.publishedAt ? formatMonthYear(edition.publishedAt, locale) : null,
  }));
  // A lista vai da mais nova para a mais antiga: a anterior vem depois, a proxima antes.
  const position = menu.findIndex((item) => item.slug === issue.slug);
  const previous = position >= 0 ? menu[position + 1] : undefined;
  const next = position > 0 ? menu[position - 1] : undefined;
  const backdrop = issue.coverImage ?? issue.pages[0]?.url ?? null;
  const date = issue.publishedAt ? formatMonthYear(issue.publishedAt, locale) : null;

  return (
    <section className="hero-under-topbar relative isolate overflow-hidden bg-[#141414] pb-14 text-white">
      {/* Fundo: a capa da propria edicao, ampliada e desfocada, com o vermelho da marca. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            sizes="640px"
            className="scale-125 object-cover opacity-50 blur-3xl"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--color-brand) 60%, transparent), transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/85" />
      </div>

      <div className="container-wide pt-8 md:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/edicoes" className="eyebrow text-white/70 transition-colors hover:text-white">
              {t.issues.eyebrow} · {t.issues.title}
            </Link>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">{issue.title}</h1>
            {date ? <p className="mt-1 text-sm text-white/70">{date}</p> : null}
          </div>
          <IssuesMenu issues={menu} current={issue.slug} />
        </div>

        <div className="mt-8 grid items-center gap-8 xl:grid-cols-[170px_minmax(0,1fr)_170px]">
          <div className="hidden xl:block">
            {previous ? <NeighborIssue issue={previous} label={t.issues.previous} align="left" /> : null}
          </div>
          <FlipbookReader
            title={issue.title}
            shareUrl={SITE_URL + localePath(path, locale)}
            magazineHref={magazinePath}
            pages={flipPages(issue, settings)}
          />
          <div className="hidden xl:block">
            {next ? <NeighborIssue issue={next} label={t.issues.next} align="right" /> : null}
          </div>
        </div>

        {/* Celular e tablet: anterior e proxima embaixo da revista. */}
        {previous || next ? (
          <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-6 xl:hidden">
            <div>
              {previous ? <NeighborIssue issue={previous} label={t.issues.previous} align="left" /> : null}
            </div>
            <div>
              {next ? <NeighborIssue issue={next} label={t.issues.next} align="right" /> : null}
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex justify-center">
          <ShareButtons title={issue.title} path={path} tone="light" />
        </div>
      </div>
    </section>
  );
}
