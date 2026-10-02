import { notFound } from "next/navigation";
import { EventForm } from "@/components/admin/EventForm";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

function toLocalInput(date: Date | null): string {
  if (!date) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [event, categories] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: {
        categories: true,
        media: { orderBy: [{ album: "asc" }, { position: "asc" }] },
      },
    }),
    prisma.category.findMany({ where: { type: "EVENT" }, orderBy: { name: "asc" } }),
  ]);

  if (!event) notFound();

  return (
    <>
      <AdminHeading title="Editar evento" description={event.title} />
      <EventForm
        categories={categories}
        event={{
          id: event.id,
          title: event.title,
          slug: event.slug,
          description: event.description ?? "",
          date: toLocalInput(event.date),
          location: event.location,
          region: event.region,
          coverImage: event.coverImage,
          coverAlt: event.coverAlt,
          status: event.status,
          categoryIds: event.categories.map((category) => category.id),
          gallery: event.media.map((media) => ({
            url: media.url,
            altText: media.altText,
            album: media.album,
          })),
        }}
      />
    </>
  );
}
