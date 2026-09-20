import { ArticleForm } from "@/components/admin/ArticleForm";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function NewArticlePage() {
  const categories = await prisma.category.findMany({
    where: { type: "ARTICLE" },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <AdminHeading title="Nova matéria" />
      <ArticleForm categories={categories} />
    </>
  );
}
