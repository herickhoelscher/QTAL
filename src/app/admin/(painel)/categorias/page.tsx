import type { Prisma } from "@prisma/client";
import { deleteCategory } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { CATEGORY_TYPE_LABEL } from "@/components/admin/labels";
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
} from "@/components/admin/ui";
import { parseListParams, skipOf, type RawListParams } from "@/lib/admin-list";
import { prisma } from "@/lib/prisma";

const BASE = "/admin/categorias";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<RawListParams & { salvo?: string }>;
}) {
  const raw = await searchParams;
  const params = parseListParams(raw, {
    sortable: ["name", "type"],
    defaultSort: "name",
    defaultDir: "asc",
  });

  const where: Prisma.CategoryWhereInput = params.q
    ? { name: { contains: params.q, mode: "insensitive" } }
    : {};

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { [params.sort]: params.dir },
      skip: skipOf(params),
      take: params.take,
      include: {
        _count: { select: { articles: true, events: true, properties: true, videos: true } },
      },
    }),
    prisma.category.count({ where }),
  ]);

  return (
    <>
      <AdminHeading
        title="Categorias"
        description="Gerencie o catálogo de categorias."
        action={{ href: BASE + "/novo", label: "Nova Categoria" }}
      />
      <SavedNotice show={raw.salvo === "1"} />
      <SearchBar params={params} />

      {categories.length ? (
        <>
          <AdminTable
            headers={[
              <SortHeader key="n" label="Registro" field="name" base={BASE} params={params} />,
              <SortHeader key="t" label="Tipo" field="type" base={BASE} params={params} />,
              "Itens",
              "",
            ]}
          >
            {categories.map((category) => {
              const { _count } = category;
              return (
                <Row key={category.id}>
                  <Cell strong>{category.name}</Cell>
                  <Cell>{CATEGORY_TYPE_LABEL[category.type]}</Cell>
                  <Cell>{_count.articles + _count.events + _count.properties + _count.videos}</Cell>
                  <RowActions
                    viewHref={`${BASE}/${category.id}`}
                    editHref={`${BASE}/${category.id}/editar`}
                  >
                    <DeleteButton
                      id={category.id}
                      action={deleteCategory}
                      confirmMessage="Excluir esta categoria? Os itens dela continuam no site, só perdem a etiqueta."
                    />
                  </RowActions>
                </Row>
              );
            })}
          </AdminTable>
          <Pagination base={BASE} params={params} total={total} />
        </>
      ) : (
        <AdminEmpty>
          {params.q ? "Nenhuma categoria encontrada para essa busca." : "Nenhuma categoria cadastrada ainda."}
        </AdminEmpty>
      )}
    </>
  );
}
