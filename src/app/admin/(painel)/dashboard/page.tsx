import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { AdminEmpty, AdminHeading, AdminTable, StatusPill } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/format";

type Props = {
  searchParams: Promise<{ ordem?: string; status?: string; regiao?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { ordem = "desc", status = "", regiao = "" } = await searchParams;
  const direction: Prisma.SortOrder = ordem === "asc" ? "asc" : "desc";

  const where: Prisma.ArticleWhereInput = {};
  if (status === "PUBLISHED" || status === "DRAFT") where.status = status;
  if (regiao) where.region = regiao;

  const [articles, regions, counts, totalViews] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { viewCount: direction },
      include: { categories: true },
      take: 100,
    }),
    prisma.article.findMany({
      where: { region: { not: null } },
      distinct: ["region"],
      select: { region: true },
      orderBy: { region: "asc" },
    }),
    Promise.all([
      prisma.article.count(),
      prisma.event.count(),
      prisma.property.count(),
      prisma.video.count(),
    ]),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
  ]);

  const [articleCount, eventCount, propertyCount, videoCount] = counts;

  const cards = [
    { label: "Matérias", value: articleCount, href: "/admin/materias" },
    { label: "Eventos", value: eventCount, href: "/admin/eventos" },
    { label: "Imóveis", value: propertyCount, href: "/admin/imoveis" },
    { label: "Vídeos", value: videoCount, href: "/admin/videos" },
    { label: "Visualizações", value: totalViews._sum.viewCount ?? 0 },
  ];

  const toggleOrder = direction === "desc" ? "asc" : "desc";
  const orderQuery = new URLSearchParams({ ordem: toggleOrder, status, regiao }).toString();

  return (
    <>
      <AdminHeading
        title="Dashboard"
        description="Desempenho das matérias e volume de conteúdo publicado."
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => {
          const content = (
            <div className="border border-line bg-surface p-5">
              <p className="eyebrow text-muted">{card.label}</p>
              <p className="mt-2 font-display text-3xl">{card.value}</p>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href} className="block hover:border-brand">
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <input type="hidden" name="ordem" value={direction} />
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-semibold">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="border border-line bg-surface px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="DRAFT">Rascunho</option>
          </select>
        </div>

        <div>
          <label htmlFor="regiao" className="mb-1 block text-xs font-semibold">
            Região
          </label>
          <select
            id="regiao"
            name="regiao"
            defaultValue={regiao}
            className="border border-line bg-surface px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {regions
              .map((row) => row.region)
              .filter((region): region is string => Boolean(region))
              .map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
          </select>
        </div>

        <button
          type="submit"
          className="eyebrow border border-line bg-surface px-5 py-2.5 hover:border-brand hover:text-brand"
        >
          Aplicar
        </button>
      </form>

      {articles.length ? (
        <AdminTable
          headers={[
            "Matéria",
            "Status",
            "Região",
            <Link key="views" href={"/admin/dashboard?" + orderQuery} className="hover:text-brand">
              Visualizações {direction === "desc" ? "↓" : "↑"}
            </Link>,
            "Publicada em",
            "",
          ]}
        >
          {articles.map((article) => (
            <tr key={article.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <p className="font-semibold">{article.title}</p>
                <p className="text-xs text-muted">
                  {article.categories.map((category) => category.name).join(", ") || "Sem categoria"}
                </p>
              </td>
              <td className="px-4 py-3">
                <StatusPill status={article.status} />
              </td>
              <td className="px-4 py-3 text-muted">{article.region ?? "—"}</td>
              <td className="px-4 py-3 font-semibold tabular-nums">{article.viewCount}</td>
              <td className="px-4 py-3 text-muted">
                {article.publishedAt ? formatDateShort(article.publishedAt) : "—"}
              </td>
              <td className="px-4 py-3">
                <Link href={"/admin/materias/" + article.id} className="text-brand hover:underline">
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <AdminEmpty>Nenhuma matéria encontrada para esse filtro.</AdminEmpty>
      )}
    </>
  );
}
