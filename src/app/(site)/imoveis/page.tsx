import type { Metadata } from "next";
import type { Prisma, PropertyType } from "@prisma/client";
import { PropertyCard } from "@/components/cards";
import { Reveal } from "@/components/Reveal";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Imóveis",
  description: "Casas, apartamentos, terrenos e salas comerciais em destaque.",
};

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "CASA", label: "Casa" },
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "TERRENO", label: "Terreno" },
  { value: "COMERCIAL", label: "Comercial" },
  { value: "RURAL", label: "Rural" },
];

const PRICE_RANGES = [
  { value: "0-300000", label: "Até R$ 300 mil" },
  { value: "300000-700000", label: "R$ 300 mil a R$ 700 mil" },
  { value: "700000-1500000", label: "R$ 700 mil a R$ 1,5 mi" },
  { value: "1500000-0", label: "Acima de R$ 1,5 mi" },
];

type Props = {
  searchParams: Promise<{ cidade?: string; tipo?: string; faixa?: string }>;
};

export default async function PropertiesPage({ searchParams }: Props) {
  const { cidade = "", tipo = "", faixa = "" } = await searchParams;

  const where: Prisma.PropertyWhereInput = { status: "PUBLISHED" };
  if (cidade) where.city = cidade;
  if (tipo) where.type = tipo as PropertyType;
  if (faixa) {
    const [min, max] = faixa.split("-").map(Number);
    where.price = { ...(min ? { gte: min } : {}), ...(max ? { lte: max } : {}) };
  }

  const [properties, cities] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.property.findMany({
      where: { status: "PUBLISHED" },
      distinct: ["city"],
      select: { city: true },
      orderBy: { city: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Mercado imobiliário"
        title="Imóveis"
        description="Casas, apartamentos, terrenos e salas comerciais em destaque."
      />

      <Section>
        <form
          method="get"
          className="mb-10 grid gap-3 border border-line bg-surface-alt p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <div>
            <label htmlFor="cidade" className="sr-only">
              Cidade
            </label>
            <select
              id="cidade"
              name="cidade"
              defaultValue={cidade}
              className="w-full border border-line bg-surface px-4 py-2.5 text-sm"
            >
              <option value="">Todas as cidades</option>
              {cities.map((row) => (
                <option key={row.city} value={row.city}>
                  {row.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tipo" className="sr-only">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              defaultValue={tipo}
              className="w-full border border-line bg-surface px-4 py-2.5 text-sm"
            >
              <option value="">Todos os tipos</option>
              {PROPERTY_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="faixa" className="sr-only">
              Faixa de valor
            </label>
            <select
              id="faixa"
              name="faixa"
              defaultValue={faixa}
              className="w-full border border-line bg-surface px-4 py-2.5 text-sm"
            >
              <option value="">Qualquer valor</option>
              {PRICE_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
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

        {properties.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property, index) => (
              <Reveal key={property.id} index={index}>
              <PropertyCard
                href={"/imoveis/" + property.slug}
                title={property.title}
                image={property.coverImage}
                city={property.city}
                region={property.region}
                type={
                  PROPERTY_TYPES.find((item) => item.value === property.type)?.label ??
                  property.type
                }
                price={property.price ? Number(property.price) : null}
                priceOnRequest={property.priceOnRequest}
                area={property.area}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                garageSpots={property.garageSpots}
                headingLevel={2}
                priority={index < 3}
              />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState>Nenhum imóvel encontrado para esse filtro.</EmptyState>
        )}
      </Section>
    </>
  );
}
