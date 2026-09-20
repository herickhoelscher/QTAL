import { CategoryManager } from "@/components/admin/CategoryManager";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <AdminHeading
        title="Categorias"
        description="Organizam matérias, eventos, imóveis e vídeos, e alimentam os filtros do site."
      />
      <CategoryManager categories={categories} />
    </>
  );
}
