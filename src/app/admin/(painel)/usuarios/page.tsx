import type { Prisma } from "@prisma/client";
import { deleteUser } from "@/app/admin/actions/auth";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ROLE_LABEL } from "@/components/admin/labels";
import {
  AdminEmpty,
  AdminHeading,
  AdminTable,
  Cell,
  Pagination,
  Pill,
  Row,
  RowActions,
  SavedNotice,
  SearchBar,
  SortHeader,
} from "@/components/admin/ui";
import { parseListParams, skipOf, type RawListParams } from "@/lib/admin-list";
import { getSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const BASE = "/admin/usuarios";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<RawListParams & { salvo?: string }>;
}) {
  const raw = await searchParams;
  const params = parseListParams(raw, { sortable: ["updatedAt", "name"], defaultSort: "updatedAt" });

  const where: Prisma.AdminUserWhereInput = params.q
    ? {
        OR: [
          { name: { contains: params.q, mode: "insensitive" } },
          { email: { contains: params.q, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total, session] = await Promise.all([
    prisma.adminUser.findMany({
      where,
      orderBy: { [params.sort]: params.dir },
      skip: skipOf(params),
      take: params.take,
      select: { id: true, name: true, email: true, role: true, active: true, updatedAt: true },
    }),
    prisma.adminUser.count({ where }),
    getSession(),
  ]);

  return (
    <>
      <AdminHeading
        title="Usuários"
        description="Gerencie o catálogo de usuários."
        action={{ href: BASE + "/novo", label: "Novo Usuário" }}
      />
      <SavedNotice show={raw.salvo === "1"} />
      <SearchBar params={params} />

      {users.length ? (
        <>
          <AdminTable
            headers={[
              <SortHeader key="n" label="Registro" field="name" base={BASE} params={params} />,
              "Perfil",
              "Acesso",
              <SortHeader key="a" label="Atualizado" field="updatedAt" base={BASE} params={params} />,
              "",
            ]}
          >
            {users.map((user) => (
              <Row key={user.id}>
                <Cell strong>
                  {user.name}
                  <span className="mt-0.5 block text-xs font-normal text-muted">{user.email}</span>
                </Cell>
                <Cell>{ROLE_LABEL[user.role]}</Cell>
                <Cell>
                  <Pill>{user.active ? "Liberado" : "Bloqueado"}</Pill>
                </Cell>
                <Cell>{formatDateTime(user.updatedAt)}</Cell>
                <RowActions viewHref={`${BASE}/${user.id}`} editHref={`${BASE}/${user.id}/editar`}>
                  {user.id !== session?.id ? (
                    <DeleteButton
                      id={user.id}
                      action={deleteUser}
                      confirmMessage="Remover o acesso desta pessoa ao painel?"
                    />
                  ) : null}
                </RowActions>
              </Row>
            ))}
          </AdminTable>
          <Pagination base={BASE} params={params} total={total} />
        </>
      ) : (
        <AdminEmpty>
          {params.q ? "Nenhum usuário encontrado para essa busca." : "Nenhum usuário cadastrado ainda."}
        </AdminEmpty>
      )}
    </>
  );
}
