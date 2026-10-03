import { notFound } from "next/navigation";
import { deleteProperty } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  BodyPreview,
  CoverPreview,
  DetailActions,
  DetailGrid,
  DetailHeading,
  DetailItem,
} from "@/components/admin/ui";
import { formatCurrency } from "@/lib/format";
import { pt } from "@/lib/i18n/dictionaries/pt";
import { prisma } from "@/lib/prisma";

const BASE = "/admin/imoveis";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      categories: { select: { name: true } },
      _count: { select: { gallery: true } },
    },
  });
  if (!property) notFound();

  return (
    <>
      <DetailHeading
        title={property.title}
        subtitle="Detalhes de imóvel"
        backHref={BASE}
        open={
          property.status === "PUBLISHED"
            ? { href: "/imoveis/" + property.slug, label: "Abrir imóvel" }
            : undefined
        }
      />

      <DetailGrid>
        <DetailItem label="Título">{property.title}</DetailItem>
        <DetailItem label="Status">
          {property.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
        </DetailItem>
        <DetailItem label="Tipo">{pt.propertyTypes[property.type]}</DetailItem>
        <DetailItem label="Valor">
          {property.priceOnRequest ? "Sob consulta" : formatCurrency(property.price?.toString())}
        </DetailItem>
        <DetailItem label="Cidade">{property.city}</DetailItem>
        <DetailItem label="Região">{property.region}</DetailItem>
        <DetailItem label="Endereço">{property.address}</DetailItem>
        <DetailItem label="Área">{property.area ? `${property.area} m²` : null}</DetailItem>
        <DetailItem label="Quartos / banheiros / vagas">
          {[property.bedrooms, property.bathrooms, property.garageSpots]
            .map((value) => value ?? "—")
            .join(" / ")}
        </DetailItem>
        <DetailItem label="Destaque">{property.featuredRank ? `Sim, posição ${property.featuredRank}` : "Não"}</DetailItem>
        <DetailItem label="Categorias">
          {property.categories.map((category) => category.name).join(", ")}
        </DetailItem>
        <DetailItem label="Fotos na galeria">{property._count.gallery}</DetailItem>
        <DetailItem label="Tour virtual">{property.tourUrl}</DetailItem>
        <DetailItem label="Endereço da página">/imoveis/{property.slug}</DetailItem>
        <DetailItem label="Imagem de capa" wide>
          <CoverPreview url={property.coverImage} alt={property.coverAlt} />
        </DetailItem>
        <DetailItem label="Descrição" wide>
          <BodyPreview html={property.description} />
        </DetailItem>
      </DetailGrid>

      <DetailActions editHref={`${BASE}/${property.id}/editar`}>
        <DeleteButton id={property.id} action={deleteProperty} variant="button" redirectTo={BASE} />
      </DetailActions>
    </>
  );
}
