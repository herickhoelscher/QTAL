import type { Prisma } from "@prisma/client";
import { deleteIssue } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  FeaturedNotice,
  FeaturedQueue,
  FeaturedStar,
  FeaturedTabs,
} from "@/components/admin/featured";
import {
  AdminEmpty,
  AdminHeading,
  AdminTable,
  Cell,
  Pagination,
  Row,
  RowActions,
  SavedNotice,
  SearchBar,
  SortHeader,
  StatusPill,
} from "@/components/admin/ui";
import { listHref, parseListParams, skipOf, type RawListParams } from "@/lib/admin-list";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const BASE = "/admin/edicoes";

export default async function AdminIssuesPage({
  searchParams,
}: {
  searchParams: Promise<RawListParams & { salvo?: string; aba?: string; aviso?: string }>;
}) {
  const raw = await searchParams;
  const params = parseListParams(raw, { sortable: ["updatedAt"], defaultSort: "updatedAt" });
  const tab = raw.aba === "destaques" ? "destaques" : "todos";

  const where: Prisma.IssueWhereInput = params.q
    ? { title: { contains: params.q, mode: "insensitive" } }
    : {};

  const [issues, total, queue] = await Promise.all([
    prisma.issue.findMany({
      where,
      orderBy: { [params.sort]: params.dir },
      skip: skipOf(params),
      take: params.take,
      select: {
        id: true,
        title: true,
        status: true,
        featuredRank: true,
        updatedAt: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.issue.count({ where }),
    prisma.issue.findMany({
      where: { featuredRank: { not: null } },
      orderBy: { featuredRank: "asc" },
      select: { id: true, title: true, status: true, featuredRank: true },
    }),
  ]);

  return (
    <>
      <AdminHeading
        title="Edições"
        description="Gerencie o catálogo de edições do Modo Revista."
        action={{ href: BASE + "/novo", label: "Nova Edição" }}
      />
      <SavedNotice show={raw.salvo === "1"} />
      <FeaturedTabs base={BASE} active={tab} count={queue.length} />
      <FeaturedNotice aviso={raw.aviso} />

      {tab === "destaques" ? (
        <FeaturedQueue
          model="issue"
          base={BASE}
          items={queue.map((item) => ({ ...item, rank: item.featuredRank }))}
        />
      ) : (
        <>
          <SearchBar params={params} />

          {issues.length ? (
            <>
              <AdminTable
                headers={[
                  "Registro",
                  "Status",
                  "Matérias",
                  <SortHeader
                    key="a"
                    label="Atualizado"
                    field="updatedAt"
                    base={BASE}
                    params={params}
                  />,
                  "Destaque",
                  "",
                ]}
              >
                {issues.map((issue) => (
                  <Row key={issue.id}>
                    <Cell strong>{issue.title}</Cell>
                    <Cell>
                      <StatusPill status={issue.status} />
                    </Cell>
                    <Cell>{issue._count.items}</Cell>
                    <Cell>{formatDateTime(issue.updatedAt)}</Cell>
                    <Cell>
                      <FeaturedStar
                        model="issue"
                        id={issue.id}
                        rank={issue.featuredRank}
                        back={listHref(BASE, params)}
                      />
                    </Cell>
                    <RowActions
                      viewHref={`${BASE}/${issue.id}`}
                      editHref={`${BASE}/${issue.id}/editar`}
                    >
                      <DeleteButton id={issue.id} action={deleteIssue} />
                    </RowActions>
                  </Row>
                ))}
              </AdminTable>
              <Pagination base={BASE} params={params} total={total} />
            </>
          ) : (
            <AdminEmpty>
              {params.q
                ? "Nenhuma edição encontrada para essa busca."
                : "Nenhuma edição montada ainda."}
            </AdminEmpty>
          )}
        </>
      )}
    </>
  );
}
