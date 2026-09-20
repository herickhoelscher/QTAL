import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { ContentCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { excerpt } from "@/lib/format";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Agenda e cobertura fotográfica dos eventos da região.",
};

type Props = {
  searchParams: Promise<{ q?: string; categoria?: string; regiao?: string }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const { q = "", categoria = "", regiao = "" } = await searchParams;

  const where: Prisma.EventWhereInput = { status: "PUBLISHED" };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }
  if (categoria) where.categories = { some: { slug: categoria } };
  if (regiao) where.region = regiao;

  const [events, categories, regions] = await Promise.all([
    prisma.event.findMany({ where, orderBy: { date: "desc" }, include: { categories: true } }),
    prisma.category.findMany({ where: { type: "EVENT" }, orderBy: { name: "asc" } }),
    prisma.event.findMany({
      where: { status: "PUBLISHED", region: { not: null } },
      distinct: ["region"],
      select: { region: true },
      orderBy: { region: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Agenda"
        title="Eventos"
        description="Agenda e cobertura fotográfica dos eventos da região."
      />

      <div className="bg-surface-alt">
        <Section wide>
        <form
          method="get"
          className="mb-10 grid gap-3 border border-line bg-surface-alt p-4 sm:grid-cols-[1fr_auto_auto_auto]"
        >
          <div>
            <label htmlFor="q" className="sr-only">
              Buscar evento
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Buscar por nome, local ou descrição"
              className="w-full border border-line bg-surface px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label htmlFor="categoria" className="sr-only">
              Categoria
            </label>
            <select
              id="categoria"
              name="categoria"
              defaultValue={categoria}
              className="w-full border border-line bg-surface px-4 py-2.5 text-sm"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="regiao" className="sr-only">
              Região
            </label>
            <select
              id="regiao"
              name="regiao"
              defaultValue={regiao}
              className="w-full border border-line bg-surface px-4 py-2.5 text-sm"
            >
              <option value="">Todas as regiões</option>
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
            className="eyebrow bg-brand px-6 py-2.5 text-white transition-colors hover:bg-brand-dark"
          >
            Filtrar
          </button>
        </form>

        {events.length ? (
          <div className="masonry-2">
            {events.map((event, index) => (
              <Reveal key={event.id} index={index}>
                <ContentCard
                  href={"/eventos/" + event.slug}
                  title={event.title}
                  excerpt={event.description ? excerpt(event.description) : null}
                  image={event.coverImage}
                  imageAlt={event.coverAlt}
                  categories={event.categories}
                  date={event.date}
                  relative={false}
                  meta={event.location ?? event.region ?? undefined}
                  aspect={index % 3 === 1 ? "3/4" : "4/3"}
                  headingLevel={2}
                  priority={index < 3}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState>Nenhum evento encontrado para esse filtro.</EmptyState>
        )}
        </Section>
      </div>
    </>
  );
}
