import { notFound } from "next/navigation";
import { IssueForm } from "@/components/admin/IssueForm";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function EditIssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [issue, articles] = await Promise.all([
    prisma.issue.findUnique({
      where: { id },
      include: { items: { orderBy: { position: "asc" } } },
    }),
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  if (!issue) notFound();

  return (
    <>
      <AdminHeading title="Editar edição" description={issue.title} />
      <IssueForm
        articles={articles}
        issue={{
          id: issue.id,
          title: issue.title,
          slug: issue.slug,
          description: issue.description,
          coverImage: issue.coverImage,
          status: issue.status,
          articleIds: issue.items.map((item) => item.articleId),
        }}
      />
    </>
  );
}
