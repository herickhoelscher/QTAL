import { IssueForm } from "@/components/admin/IssueForm";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export default async function NewIssuePage() {
  const [articles, settings] = await Promise.all([
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true },
    }),
    getSettings(),
  ]);

  return (
    <>
      <AdminHeading title="Nova Edição" description="Use este formulário para gerenciar o registro." />
      <IssueForm
        articles={articles}
        brand={{ siteName: settings.siteName, clientLogoUrl: settings.clientLogoUrl }}
      />
    </>
  );
}
