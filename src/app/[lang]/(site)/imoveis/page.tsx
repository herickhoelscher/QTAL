import type { Metadata } from "next";
import type { Prisma, PropertyType } from "@prisma/client";
import { PropertyCard } from "@/components/cards";
import { PropertyPlaceFilter } from "@/components/PropertyPlaceFilter";
import { Reveal } from "@/components/Reveal";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/server";
import { alternatesFor } from "@/lib/i18n/seo";
import { localize } from "@/lib/i18n/localize";
import { compareNames, mergeNeighborhoods } from "@/lib/location";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.nav.properties,
    description: t.properties.metaDescription,
    alternates: await alternatesFor("/imoveis"),
  };
}

const PROPERTY_TYPES: PropertyType[] = ["CASA", "APARTAMENTO", "TERRENO", "COMERCIAL", "RURAL"];

type Props = {
  searchParams: Promise<{ cidade?: string; bairro?: string; tipo?: string; faixa?: string }>;
};

export default async function PropertiesPage({ searchParams }: Props) {
  const { cidade = "", bairro = "", tipo = "", faixa = "" } = await searchParams;

  const where: Prisma.PropertyWhereInput = { status: "PUBLISHED" };
  if (cidade) where.city = cidade;
  if (cidade && bairro) where.neighborhood = { equals: bairro, mode: "insensitive" };
  if (tipo) where.type = tipo as PropertyType;
  if (faixa) {
    const [min, max] = faixa.split("-").map(Number);
    where.price = { ...(min ? { gte: min } : {}), ...(max ? { lte: max } : {}) };
  }

  const [properties, places] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: [{ featuredRank: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    }),
    prisma.property.findMany({
      where: { status: "PUBLISHED" },
      distinct: ["city", "neighborhood"],
      select: { city: true, neighborhood: true },
    }),
  ]);

  // Cidades em ordem alfabetica, cada uma com os bairros que tem imovel publicado.
  const neighborhoodsByCity = Object.fromEntries(
    [...new Set(places.map((row) => row.city))]
      .sort(compareNames)
      .map((city) => [
        city,
        mergeNeighborhoods(places.filter((row) => row.city === city).map((row) => row.neighborhood)),
      ]),
  );

  const { t } = await getDictionary();
  await localize([{ model: "property", records: properties }]);

  const priceRanges = [
    { value: "0-300000", label: t.properties.rangeUpTo300k },
    { value: "300000-700000", label: t.properties.range300kTo700k },
    { value: "700000-1500000", label: t.properties.range700kTo1500k },
    { value: "1500000-0", label: t.properties.rangeAbove1500k },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t.properties.eyebrow}
        title={t.nav.properties}
        description={t.properties.metaDescription}
      />

      <Section>
        <form
          method="get"
          className="mb-10 grid gap-3 border border-line bg-surface-alt p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
        >
          <PropertyPlaceFilter
            neighborhoodsByCity={neighborhoodsByCity}
            city={cidade}
            neighborhood={bairro}
            labels={{
              city: t.properties.city,
              allCities: t.properties.allCities,
              neighborhood: t.properties.neighborhood,
              allNeighborhoods: t.properties.allNeighborhoods,
            }}
          />

          <div>
            <label htmlFor="tipo" className="sr-only">
              {t.properties.type}
            </label>
            <select
              id="tipo"
              name="tipo"
              defaultValue={tipo}
              className="w-full border border-line bg-surface px-4 py-2.5 text-sm"
            >
              <option value="">{t.properties.allTypes}</option>
              {PROPERTY_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t.propertyTypes[value]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="faixa" className="sr-only">
              {t.properties.priceRange}
            </label>
            <select
              id="faixa"
              name="faixa"
              defaultValue={faixa}
              className="w-full border border-line bg-surface px-4 py-2.5 text-sm"
            >
              <option value="">{t.properties.anyPrice}</option>
              {priceRanges.map((range) => (
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
            {t.properties.filter}
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
                neighborhood={property.neighborhood}
                type={property.type}
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
          <EmptyState>{t.properties.empty}</EmptyState>
        )}
      </Section>
    </>
  );
}
