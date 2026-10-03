import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminHeading } from "@/components/admin/ui";

export default function NewCategoryPage() {
  return (
    <>
      <AdminHeading title="Nova Categoria" description="Use este formulário para gerenciar o registro." />
      <CategoryForm />
    </>
  );
}
