import { notFound } from "next/navigation";
import { deleteUser } from "@/app/admin/actions/auth";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ROLE_LABEL } from "@/components/admin/labels";
import { DetailActions, DetailGrid, DetailHeading, DetailItem } from "@/components/admin/ui";
import { getSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const BASE = "/admin/usuarios";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, session] = await Promise.all([
    prisma.adminUser.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    }),
    getSession(),
  ]);
  if (!user) notFound();

  return (
    <>
      <DetailHeading title={user.name} subtitle="Detalhes de usuário" backHref={BASE} />

      <DetailGrid>
        <DetailItem label="Nome">{user.name}</DetailItem>
        <DetailItem label="E-mail">{user.email}</DetailItem>
        <DetailItem label="Perfil">{ROLE_LABEL[user.role]}</DetailItem>
        <DetailItem label="Acesso">{user.active ? "Liberado" : "Bloqueado"}</DetailItem>
        <DetailItem label="Matérias assinadas">{user._count.articles}</DetailItem>
        <DetailItem label="Criado em">{formatDateTime(user.createdAt)}</DetailItem>
      </DetailGrid>

      <DetailActions editHref={`${BASE}/${user.id}/editar`}>
        {user.id !== session?.id ? (
          <DeleteButton
            id={user.id}
            action={deleteUser}
            variant="button"
            redirectTo={BASE}
            confirmMessage="Remover o acesso desta pessoa ao painel?"
          />
        ) : null}
      </DetailActions>
    </>
  );
}
