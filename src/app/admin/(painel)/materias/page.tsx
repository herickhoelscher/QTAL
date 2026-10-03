import type { Prisma } from "@prisma/client";
import { deleteArticle } from "@/app/admin/actions/content";
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

const BASE = "/admin/materias";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<RawListParams & { salvo?: string; aba?: string; aviso?: string }>;
}) {
  const raw = await searchParams;
  const params = parseListParams(raw, {
    sortable: ["updatedAt", "viewCount"],
    defaultSort: "updatedAt",
  });
  const tab = raw.aba === "destaques" ? "destaques" : "todos";

  const where: Prisma.ArticleWhereInput = params.q
    ? { title: { contains: params.q, mode: "insensitive" } }
    : {};

  const [articles, total, queue] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { [params.sort]: params.dir },
      skip: skipOf(params),
      take: params.take,
      select: {
        id: true,
        title: true,
        status: true,
        featuredRank: true,
        viewCount: true,
        updatedAt: true,
      },
    }),
    prisma.article.count({ where }),
    prisma.article.findMany({
      where: { featuredRank: { not: null } },
      orderBy: { featuredRank: "asc" },
      select: { id: true, title: true, status: true, featuredRank: true },
    }),
  ]);

  return (
    <>
      <AdminHeading
        title="Matérias"
        description="Gerencie o catálogo de matérias."
        action={{ href: BASE + "/novo", label: "Nova Matéria" }}
      />
      <SavedNotice show={raw.salvo === "1"} />
      <FeaturedTabs base={BASE} active={tab} count={queue.length} />
      <FeaturedNotice aviso={raw.aviso} />

      {tab === "destaques" ? (
        <FeaturedQueue
          model="article"
          base={BASE}
          items={queue.map((item) => ({ ...item, rank: item.featuredRank }))}
        />
      ) : (
        <>
          <SearchBar params={params} />

          {articles.length ? (
            <>
              <AdminTable
                headers={[
                  "Registro",
                  "Status",
                  <SortHeader
                    key="v"
                    label="Visualizações"
                    field="viewCount"
                    base={BASE}
                    params={params}
                  />,
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
                {articles.map((article) => (
                  <Row key={article.id}>
                    <Cell strong>{article.title}</Cell>
                    <Cell>
                      <StatusPill status={article.status} />
                    </Cell>
                    <Cell>{article.viewCount}</Cell>
                    <Cell>{formatDateTime(article.updatedAt)}</Cell>
                    <Cell>
                      <FeaturedStar
                        model="article"
                        id={article.id}
                        rank={article.featuredRank}
                        back={listHref(BASE, params)}
                      />
                    </Cell>
                    <RowActions
                      viewHref={`${BASE}/${article.id}`}
                      editHref={`${BASE}/${article.id}/editar`}
                    >
                      <DeleteButton id={article.id} action={deleteArticle} />
                    </RowActions>
                  </Row>
                ))}
              </AdminTable>
              <Pagination base={BASE} params={params} total={total} />
            </>
          ) : (
            <AdminEmpty>
              {params.q
                ? "Nenhuma matéria encontrada para essa busca."
                : "Nenhuma matéria cadastrada ainda."}
            </AdminEmpty>
          )}
        </>
      )}
    </>
  );
}
