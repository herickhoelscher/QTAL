import { PropertyForm } from "@/components/admin/PropertyForm";
import { AdminHeading } from "@/components/admin/ui";

export default function NewPropertyPage() {
  return (
    <>
      <AdminHeading title="Novo Imóvel" description="Use este formulário para gerenciar o registro." />
      <PropertyForm />
    </>
  );
}
