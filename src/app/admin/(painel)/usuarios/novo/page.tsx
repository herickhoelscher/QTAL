import { UserForm } from "@/components/admin/UserForm";
import { AdminHeading } from "@/components/admin/ui";

export default function NewUserPage() {
  return (
    <>
      <AdminHeading title="Novo Usuário" description="Use este formulário para gerenciar o registro." />
      <UserForm />
    </>
  );
}
