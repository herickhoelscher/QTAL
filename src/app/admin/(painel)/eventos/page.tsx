import type { Prisma } from "@prisma/client";
import { deleteEvent } from "@/app/admin/actions/content";
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
import { formatDateShort, formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const BASE = "/admin/eventos";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<RawListParams & { salvo?: string; aba?: string; aviso?: string }>;
}) {
  const raw = await searchParams;
  const params = parseListParams(raw, { sortable: ["date", "updatedAt"], defaultSort: "date" });
  const tab = raw.aba === "destaques" ? "destaques" : "todos";

  const where: Prisma.EventWhereInput = params.q
    ? { title: { contains: params.q, mode: "insensitive" } }
    : {};

  const [events, total, queue] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { [params.sort]: params.dir },
      skip: skipOf(params),
      take: params.take,
      select: {
        id: true,
        title: true,
        status: true,
        featuredRank: true,
        date: true,
        updatedAt: true,
      },
    }),
    prisma.event.count({ where }),
    prisma.event.findMany({
      where: { featuredRank: { not: null } },
      orderBy: { featuredRank: "asc" },
      select: { id: true, title: true, status: true, featuredRank: true },
    }),
  ]);

  return (
    <>
      <AdminHeading
        title="Eventos"
        description="Gerencie o catálogo de eventos."
        action={{ href: BASE + "/novo", label: "Novo Evento" }}
      />
      <SavedNotice show={raw.salvo === "1"} />
      <FeaturedTabs base={BASE} active={tab} count={queue.length} />
      <FeaturedNotice aviso={raw.aviso} />

      {tab === "destaques" ? (
        <FeaturedQueue
          model="event"
          base={BASE}
          items={queue.map((item) => ({ ...item, rank: item.featuredRank }))}
        />
      ) : (
        <>
          <SearchBar params={params} />

          {events.length ? (
            <>
              <AdminTable
                headers={[
                  "Registro",
                  "Status",
                  <SortHeader key="d" label="Data" field="date" base={BASE} params={params} />,
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
                {events.map((event) => (
                  <Row key={event.id}>
                    <Cell strong>{event.title}</Cell>
                    <Cell>
                      <StatusPill status={event.status} />
                    </Cell>
                    <Cell>{formatDateShort(event.date)}</Cell>
                    <Cell>{formatDateTime(event.updatedAt)}</Cell>
                    <Cell>
                      <FeaturedStar
                        model="event"
                        id={event.id}
                        rank={event.featuredRank}
                        back={listHref(BASE, params)}
                      />
                    </Cell>
                    <RowActions
                      viewHref={`${BASE}/${event.id}`}
                      editHref={`${BASE}/${event.id}/editar`}
                    >
                      <DeleteButton id={event.id} action={deleteEvent} />
                    </RowActions>
                  </Row>
                ))}
              </AdminTable>
              <Pagination base={BASE} params={params} total={total} />
            </>
          ) : (
            <AdminEmpty>
              {params.q
                ? "Nenhum evento encontrado para essa busca."
                : "Nenhum evento cadastrado ainda."}
            </AdminEmpty>
          )}
        </>
      )}
    </>
  );
}
