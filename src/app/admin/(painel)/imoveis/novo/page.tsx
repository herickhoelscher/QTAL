import { PropertyForm } from "@/components/admin/PropertyForm";
import { AdminHeading } from "@/components/admin/ui";

export default function NewPropertyPage() {
  return (
    <>
      <AdminHeading title="Novo imóvel" />
      <PropertyForm />
    </>
  );
}
