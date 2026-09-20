import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: { gallery: { orderBy: { position: "asc" } } },
  });

  if (!property) notFound();

  return (
    <>
      <AdminHeading title="Editar imóvel" description={property.title} />
      <PropertyForm
        property={{
          id: property.id,
          title: property.title,
          slug: property.slug,
          type: property.type,
          city: property.city,
          region: property.region,
          address: property.address,
          price: property.price ? String(property.price) : "",
          priceOnRequest: property.priceOnRequest,
          area: property.area ? String(property.area) : "",
          bedrooms: property.bedrooms ? String(property.bedrooms) : "",
          bathrooms: property.bathrooms ? String(property.bathrooms) : "",
          garageSpots: property.garageSpots ? String(property.garageSpots) : "",
          description: property.description ?? "",
          coverImage: property.coverImage,
          coverAlt: property.coverAlt,
          mapEmbedUrl: property.mapEmbedUrl,
          tourUrl: property.tourUrl,
          featured: property.featured,
          status: property.status,
          gallery: property.gallery.map((media) => ({
            url: media.url,
            altText: media.altText,
          })),
        }}
      />
    </>
  );
}
