import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Select } from "@/components/admin/form";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/components/admin/styles";
import {
  AdminEmpty,
  AdminTable,
  Card,
  Cell,
  Row,
  RowActions,
  StatusPill,
} from "@/components/admin/ui";
import { getSession } from "@/lib/auth";
import { formatDateShort } from "@/lib/format";
import { placeLabel } from "@/lib/location";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ ordem?: string; status?: string; cidade?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { ordem = "desc", status = "", cidade = "" } = await searchParams;
  const direction: Prisma.SortOrder = ordem === "asc" ? "asc" : "desc";
  const session = await getSession();

  const where: Prisma.ArticleWhereInput = {};
  if (status === "PUBLISHED" || status === "DRAFT") where.status = status;
  if (cidade) where.city = cidade;

  // Uma contagem agrupada por status em cada tabela, em vez de uma consulta por
  // numero: o banco fica longe e cada ida e volta pesa.
  const [articles, cities, articleCounts, eventCounts, propertyCounts, videoCounts, userCount] =
    await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { viewCount: direction },
        include: { categories: true },
        take: 100,
      }),
      prisma.article.findMany({
        where: { city: { not: null } },
        distinct: ["city"],
        select: { city: true },
        orderBy: { city: "asc" },
      }),
      prisma.article.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.event.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.property.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.video.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.adminUser.count(),
    ]);

  const count = (rows: { status: string; _count: { _all: number } }[], status?: string) =>
    rows
      .filter((row) => !status || row.status === status)
      .reduce((sum, row) => sum + row._count._all, 0);

  const published = count(articleCounts, "PUBLISHED");
  const drafts =
    count(articleCounts, "DRAFT") +
    count(eventCounts, "DRAFT") +
    count(propertyCounts, "DRAFT") +
    count(videoCounts, "DRAFT");
  const eventCount = count(eventCounts);
  const propertyCount = count(propertyCounts);
  const videoCount = count(videoCounts);

  const cards = [
    { label: "Matérias publicadas", value: published, href: "/admin/materias" },
    { label: "Rascunhos", value: drafts },
    { label: "Eventos", value: eventCount, href: "/admin/eventos" },
    { label: "Imóveis", value: propertyCount, href: "/admin/imoveis" },
    { label: "Vídeos", value: videoCount, href: "/admin/videos" },
    {
      label: "Usuários",
      value: userCount,
      href: session?.role === "ADMIN" ? "/admin/usuarios" : undefined,
    },
  ];

  const toggleOrder = direction === "desc" ? "asc" : "desc";
  const orderQuery = new URLSearchParams({ ordem: toggleOrder, status, cidade }).toString();

  return (
    <div className="mx-auto max-w-[1220px]">
      <h1 className="sr-only">Painel</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const content = (
            <Card className="h-full px-6 py-7 transition-colors">
              <p className="text-sm font-medium tracking-[0.2em] text-muted uppercase">
                {card.label}
              </p>
              <p className="mt-3 text-4xl font-black text-ink tabular-nums">{card.value}</p>
            </Card>
          );
          return card.href ? (
            <Link key={card.label} href={card.href} className="block rounded-2xl hover:[&>div]:border-ink/30">
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      <Card className="mt-8 px-6 py-6">
        <h2 className="text-xl font-semibold text-ink">Ações rápidas</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/materias/novo" className={PRIMARY_BUTTON + " rounded-full"}>
            Nova matéria
          </Link>
          <Link href="/admin/eventos/novo" className={SECONDARY_BUTTON + " rounded-full"}>
            Novo evento
          </Link>
          <Link href="/admin/imoveis/novo" className={SECONDARY_BUTTON + " rounded-full"}>
            Novo imóvel
          </Link>
          <Link href="/admin/videos/novo" className={SECONDARY_BUTTON + " rounded-full"}>
            Novo vídeo
          </Link>
          {session?.role === "ADMIN" ? (
            <Link href="/admin/usuarios/novo" className={SECONDARY_BUTTON + " rounded-full"}>
              Novo usuário
            </Link>
          ) : null}
        </div>
      </Card>

      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">Desempenho das matérias</h2>
            <p className="mt-1 text-sm text-muted">Visualizações por matéria, com filtro por status e cidade.</p>
          </div>

          <form method="get" className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="ordem" value={direction} />
            <label className="grid gap-1 text-[13px] font-semibold text-ink">
              Status
              <Select name="status" defaultValue={status} className="min-w-36">
                <option value="">Todos</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="DRAFT">Rascunho</option>
              </Select>
            </label>
            <label className="grid gap-1 text-[13px] font-semibold text-ink">
              Cidade
              <Select name="cidade" defaultValue={cidade} className="min-w-36">
                <option value="">Todas</option>
                {cities
                  .map((row) => row.city)
                  .filter((city): city is string => Boolean(city))
                  .map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
              </Select>
            </label>
            <button type="submit" className={PRIMARY_BUTTON}>
              Aplicar
            </button>
          </form>
        </div>

        {articles.length ? (
          <AdminTable
            headers={[
              "Registro",
              "Status",
              "Cidade",
              <Link key="views" href={"/admin/dashboard?" + orderQuery} className="hover:text-ink">
                Visualizações {direction === "desc" ? "↓" : "↑"}
              </Link>,
              "Publicada em",
              "",
            ]}
          >
            {articles.map((article) => (
              <Row key={article.id}>
                <Cell strong>
                  {article.title}
                  <span className="mt-0.5 block text-xs font-normal text-muted">
                    {article.categories.map((category) => category.name).join(", ") || "Sem categoria"}
                  </span>
                </Cell>
                <Cell>
                  <StatusPill status={article.status} />
                </Cell>
                <Cell>{placeLabel(article) ?? "—"}</Cell>
                <Cell strong>{article.viewCount}</Cell>
                <Cell>{article.publishedAt ? formatDateShort(article.publishedAt) : "—"}</Cell>
                <RowActions
                  viewHref={"/admin/materias/" + article.id}
                  editHref={"/admin/materias/" + article.id + "/editar"}
                />
              </Row>
            ))}
          </AdminTable>
        ) : (
          <AdminEmpty>Nenhuma matéria encontrada para esse filtro.</AdminEmpty>
        )}
      </section>
    </div>
  );
}
