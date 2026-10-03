import { IssueForm } from "@/components/admin/IssueForm";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function NewIssuePage() {
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <>
      <AdminHeading title="Nova Edição" description="Use este formulário para gerenciar o registro." />
      <IssueForm articles={articles} />
    </>
  );
}
