import { notFound } from "next/navigation";
import { deleteVideo } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  CoverPreview,
  DetailActions,
  DetailGrid,
  DetailHeading,
  DetailItem,
} from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { providerLabel, thumbnailUrl } from "@/lib/video";

const BASE = "/admin/videos";

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      categories: { select: { name: true } },
      event: { select: { title: true } },
      article: { select: { title: true } },
      property: { select: { title: true } },
    },
  });
  if (!video) notFound();

  return (
    <>
      <DetailHeading
        title={video.title}
        subtitle="Detalhes de vídeo"
        backHref={BASE}
        open={
          video.status === "PUBLISHED"
            ? { href: "/videos/" + video.slug, label: "Abrir vídeo" }
            : undefined
        }
      />

      <DetailGrid>
        <DetailItem label="Título">{video.title}</DetailItem>
        <DetailItem label="Status">{video.status === "PUBLISHED" ? "Publicado" : "Rascunho"}</DetailItem>
        <DetailItem label="Origem">{providerLabel(video.provider)}</DetailItem>
        <DetailItem label="Link original">
          <a href={video.externalUrl} target="_blank" rel="noreferrer" className="text-link hover:underline">
            {video.externalUrl}
          </a>
        </DetailItem>
        <DetailItem label="Formato">{video.vertical ? "Vertical" : "Horizontal"}</DetailItem>
        <DetailItem label="Destaque">{video.featuredRank ? `Sim, posição ${video.featuredRank}` : "Não"}</DetailItem>
        <DetailItem label="Publicado em">
          {video.publishedAt ? formatDateTime(video.publishedAt) : null}
        </DetailItem>
        <DetailItem label="Categorias">
          {video.categories.map((category) => category.name).join(", ")}
        </DetailItem>
        <DetailItem label="Ligado a">
          {[video.event?.title, video.article?.title, video.property?.title]
            .filter(Boolean)
            .join(" · ")}
        </DetailItem>
        <DetailItem label="Endereço da página">/videos/{video.slug}</DetailItem>
        <DetailItem label="Miniatura" wide>
          <CoverPreview url={thumbnailUrl(video.provider, video.embedId, video.customThumbnail)} />
        </DetailItem>
        <DetailItem label="Descrição" wide>
          {video.description ? <span className="whitespace-pre-line">{video.description}</span> : null}
        </DetailItem>
      </DetailGrid>

      <DetailActions editHref={`${BASE}/${video.id}/editar`}>
        <DeleteButton id={video.id} action={deleteVideo} variant="button" redirectTo={BASE} />
      </DetailActions>
    </>
  );
}
