import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <>
      <AdminHeading title="Editar Categoria" description="Use este formulário para gerenciar o registro." />
      <CategoryForm category={{ id: category.id, name: category.name, type: category.type }} />
    </>
  );
}
