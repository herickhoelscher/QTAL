import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/LocalizedLink";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/server";
import { alternatesFor } from "@/lib/i18n/seo";
import { localize } from "@/lib/i18n/localize";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.issues.title,
    description: t.issues.description,
    alternates: await alternatesFor("/edicoes"),
  };
}

export default async function IssuesPage() {
  const { t } = await getDictionary();

  // Destaques escolhidos no painel primeiro; depois, da mais nova para a mais antiga.
  const issues = await prisma.issue.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featuredRank: { sort: "asc", nulls: "last" } }, { publishedAt: "desc" }],
    select: { id: true, slug: true, title: true, description: true, coverImage: true },
  });
  await localize([{ model: "issue", records: issues }]);

  return (
    <>
      <PageHeader
        eyebrow={t.issues.eyebrow}
        title={t.issues.title}
        description={t.issues.description}
      />
      <Section>
        {issues.length ? (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {issues.map((issue) => (
              <li key={issue.id}>
                <Link href={"/edicoes/" + issue.slug} className="group block">
                  <span className="relative block aspect-[3/4] overflow-hidden rounded-md bg-surface-alt shadow-[0_12px_30px_-12px_rgba(0,0,0,0.45)]">
                    {issue.coverImage ? (
                      <Image
                        src={issue.coverImage}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </span>
                  <span className="mt-3 block font-semibold group-hover:text-brand">
                    {issue.title}
                  </span>
                  <span className="eyebrow mt-1 block text-brand">{t.issues.read} →</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>{t.issues.empty}</EmptyState>
        )}
      </Section>
    </>
  );
}
