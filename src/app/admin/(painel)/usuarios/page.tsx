import { redirect } from "next/navigation";
import { UserManager } from "@/components/admin/UserManager";
import { AdminHeading } from "@/components/admin/ui";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/admin/dashboard");

  const users = await prisma.adminUser.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <AdminHeading
        title="Usuários"
        description="Quem pode entrar no painel e o que cada pessoa pode fazer."
      />
      <UserManager
        currentId={session.id}
        users={users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
        }))}
      />
    </>
  );
}
