import { notFound } from "next/navigation";
import { deleteEvent } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  BodyPreview,
  CoverPreview,
  DetailActions,
  DetailGrid,
  DetailHeading,
  DetailItem,
} from "@/components/admin/ui";
import { formatDateShort } from "@/lib/format";
import { fullPlace } from "@/lib/location";
import { prisma } from "@/lib/prisma";

const BASE = "/admin/eventos";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      categories: { select: { name: true } },
      _count: { select: { media: true, videos: true } },
    },
  });
  if (!event) notFound();

  return (
    <>
      <DetailHeading
        title={event.title}
        subtitle="Detalhes de evento"
        backHref={BASE}
        open={
          event.status === "PUBLISHED"
            ? { href: "/eventos/" + event.slug, label: "Abrir evento" }
            : undefined
        }
      />

      <DetailGrid>
        <DetailItem label="Título">{event.title}</DetailItem>
        <DetailItem label="Status">{event.status === "PUBLISHED" ? "Publicado" : "Rascunho"}</DetailItem>
        <DetailItem label="Data">{formatDateShort(event.date)}</DetailItem>
        <DetailItem label="Local">{event.location}</DetailItem>
        <DetailItem label="Localização">{fullPlace(event)}</DetailItem>
        <DetailItem label="Categorias">
          {event.categories.map((category) => category.name).join(", ")}
        </DetailItem>
        <DetailItem label="Endereço da página">/eventos/{event.slug}</DetailItem>
        <DetailItem label="Fotos e vídeos">
          {event._count.media} fotos · {event._count.videos} vídeos
        </DetailItem>
        <DetailItem label="Imagem de capa" wide>
          <CoverPreview url={event.coverImage} alt={event.coverAlt} />
        </DetailItem>
        <DetailItem label="Descrição" wide>
          <BodyPreview html={event.description} />
        </DetailItem>
      </DetailGrid>

      <DetailActions editHref={`${BASE}/${event.id}/editar`}>
        <DeleteButton id={event.id} action={deleteEvent} variant="button" redirectTo={BASE} />
      </DetailActions>
    </>
  );
}
