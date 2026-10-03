import { notFound } from "next/navigation";
import { UserForm } from "@/components/admin/UserForm";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <>
      <AdminHeading title="Editar Usuário" description="Use este formulário para gerenciar o registro." />
      <UserForm
        user={{ id: user.id, name: user.name, email: user.email, role: user.role, active: user.active }}
      />
    </>
  );
}
