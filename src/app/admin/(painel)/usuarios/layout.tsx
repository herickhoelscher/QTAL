import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

/** Usuarios e so para administrador: vale para a lista, Ver, Editar e Novo. */
export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/admin/dashboard");
  return children;
}
