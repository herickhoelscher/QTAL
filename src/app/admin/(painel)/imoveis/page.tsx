import type { Prisma } from "@prisma/client";
import { deleteProperty } from "@/app/admin/actions/content";
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

const BASE = "/admin/imoveis";

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<RawListParams & { salvo?: string; aba?: string; aviso?: string }>;
}) {
  const raw = await searchParams;
  const params = parseListParams(raw, { sortable: ["updatedAt"], defaultSort: "updatedAt" });
  const tab = raw.aba === "destaques" ? "destaques" : "todos";

  const where: Prisma.PropertyWhereInput = params.q
    ? {
        OR: [
          { title: { contains: params.q, mode: "insensitive" } },
          { city: { contains: params.q, mode: "insensitive" } },
          { neighborhood: { contains: params.q, mode: "insensitive" } },
        ],
      }
    : {};

  const [properties, total, queue] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { [params.sort]: params.dir },
      skip: skipOf(params),
      take: params.take,
      select: {
        id: true,
        title: true,
        status: true,
        featuredRank: true,
        city: true,
        updatedAt: true,
      },
    }),
    prisma.property.count({ where }),
    prisma.property.findMany({
      where: { featuredRank: { not: null } },
      orderBy: { featuredRank: "asc" },
      select: { id: true, title: true, status: true, featuredRank: true },
    }),
  ]);

  return (
    <>
      <AdminHeading
        title="Imóveis"
        description="Gerencie o catálogo de imóveis."
        action={{ href: BASE + "/novo", label: "Novo Imóvel" }}
      />
      <SavedNotice show={raw.salvo === "1"} />
      <FeaturedTabs base={BASE} active={tab} count={queue.length} />
      <FeaturedNotice aviso={raw.aviso} />

      {tab === "destaques" ? (
        <FeaturedQueue
          model="property"
          base={BASE}
          items={queue.map((item) => ({ ...item, rank: item.featuredRank }))}
        />
      ) : (
        <>
          <SearchBar params={params} />

          {properties.length ? (
            <>
              <AdminTable
                headers={[
                  "Registro",
                  "Status",
                  "Cidade",
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
                {properties.map((property) => (
                  <Row key={property.id}>
                    <Cell strong>{property.title}</Cell>
                    <Cell>
                      <StatusPill status={property.status} />
                    </Cell>
                    <Cell>{property.city}</Cell>
                    <Cell>{formatDateTime(property.updatedAt)}</Cell>
                    <Cell>
                      <FeaturedStar
                        model="property"
                        id={property.id}
                        rank={property.featuredRank}
                        back={listHref(BASE, params)}
                      />
                    </Cell>
                    <RowActions
                      viewHref={`${BASE}/${property.id}`}
                      editHref={`${BASE}/${property.id}/editar`}
                    >
                      <DeleteButton id={property.id} action={deleteProperty} />
                    </RowActions>
                  </Row>
                ))}
              </AdminTable>
              <Pagination base={BASE} params={params} total={total} />
            </>
          ) : (
            <AdminEmpty>
              {params.q
                ? "Nenhum imóvel encontrado para essa busca."
                : "Nenhum imóvel cadastrado ainda."}
            </AdminEmpty>
          )}
        </>
      )}
    </>
  );
}
