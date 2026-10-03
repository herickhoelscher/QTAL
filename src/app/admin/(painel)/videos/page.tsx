import type { Prisma } from "@prisma/client";
import { deleteVideo } from "@/app/admin/actions/content";
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
import { providerLabel } from "@/lib/video";

const BASE = "/admin/videos";

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<RawListParams & { salvo?: string; aba?: string; aviso?: string }>;
}) {
  const raw = await searchParams;
  const params = parseListParams(raw, { sortable: ["updatedAt"], defaultSort: "updatedAt" });
  const tab = raw.aba === "destaques" ? "destaques" : "todos";

  const where: Prisma.VideoWhereInput = params.q
    ? { title: { contains: params.q, mode: "insensitive" } }
    : {};

  const [videos, total, queue] = await Promise.all([
    prisma.video.findMany({
      where,
      orderBy: { [params.sort]: params.dir },
      skip: skipOf(params),
      take: params.take,
      select: {
        id: true,
        title: true,
        status: true,
        featuredRank: true,
        provider: true,
        updatedAt: true,
      },
    }),
    prisma.video.count({ where }),
    prisma.video.findMany({
      where: { featuredRank: { not: null } },
      orderBy: { featuredRank: "asc" },
      select: { id: true, title: true, status: true, featuredRank: true },
    }),
  ]);

  return (
    <>
      <AdminHeading
        title="Vídeos"
        description="Gerencie o catálogo de vídeos."
        action={{ href: BASE + "/novo", label: "Novo Vídeo" }}
      />
      <SavedNotice show={raw.salvo === "1"} />
      <FeaturedTabs base={BASE} active={tab} count={queue.length} />
      <FeaturedNotice aviso={raw.aviso} />

      {tab === "destaques" ? (
        <FeaturedQueue
          model="video"
          base={BASE}
          items={queue.map((item) => ({ ...item, rank: item.featuredRank }))}
        />
      ) : (
        <>
          <SearchBar params={params} />

          {videos.length ? (
            <>
              <AdminTable
                headers={[
                  "Registro",
                  "Status",
                  "Origem",
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
                {videos.map((video) => (
                  <Row key={video.id}>
                    <Cell strong>{video.title}</Cell>
                    <Cell>
                      <StatusPill status={video.status} />
                    </Cell>
                    <Cell>{providerLabel(video.provider)}</Cell>
                    <Cell>{formatDateTime(video.updatedAt)}</Cell>
                    <Cell>
                      <FeaturedStar
                        model="video"
                        id={video.id}
                        rank={video.featuredRank}
                        back={listHref(BASE, params)}
                      />
                    </Cell>
                    <RowActions
                      viewHref={`${BASE}/${video.id}`}
                      editHref={`${BASE}/${video.id}/editar`}
                    >
                      <DeleteButton id={video.id} action={deleteVideo} />
                    </RowActions>
                  </Row>
                ))}
              </AdminTable>
              <Pagination base={BASE} params={params} total={total} />
            </>
          ) : (
            <AdminEmpty>
              {params.q
                ? "Nenhum vídeo encontrado para essa busca."
                : "Nenhum vídeo cadastrado ainda."}
            </AdminEmpty>
          )}
        </>
      )}
    </>
  );
}
