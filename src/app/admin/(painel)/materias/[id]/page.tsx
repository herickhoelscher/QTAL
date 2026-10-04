import { notFound } from "next/navigation";
import { deleteArticle } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  BodyPreview,
  CoverPreview,
  DetailActions,
  DetailGrid,
  DetailHeading,
  DetailItem,
} from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { fullPlace } from "@/lib/location";
import { prisma } from "@/lib/prisma";

const BASE = "/admin/materias";

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      categories: { select: { name: true } },
      author: { select: { name: true } },
      _count: { select: { gallery: true } },
    },
  });
  if (!article) notFound();

  return (
    <>
      <DetailHeading
        title={article.title}
        subtitle="Detalhes de matéria"
        backHref={BASE}
        open={
          article.status === "PUBLISHED"
            ? { href: "/materias/" + article.slug, label: "Abrir matéria" }
            : undefined
        }
      />

      <DetailGrid>
        <DetailItem label="Título">{article.title}</DetailItem>
        <DetailItem label="Linha de apoio">{article.subtitle}</DetailItem>
        <DetailItem label="Status">{article.status === "PUBLISHED" ? "Publicado" : "Rascunho"}</DetailItem>
        <DetailItem label="Destaque">{article.featuredRank ? `Sim, posição ${article.featuredRank}` : "Não"}</DetailItem>
        <DetailItem label="Publicado em">
          {article.publishedAt ? formatDateTime(article.publishedAt) : null}
        </DetailItem>
        <DetailItem label="Visualizações">{article.viewCount}</DetailItem>
        <DetailItem label="Endereço da página">/materias/{article.slug}</DetailItem>
        <DetailItem label="Localização">{fullPlace(article)}</DetailItem>
        <DetailItem label="Categorias">
          {article.categories.map((category) => category.name).join(", ")}
        </DetailItem>
        <DetailItem label="Autor">{article.author?.name}</DetailItem>
        <DetailItem label="Imagem de capa">
          <CoverPreview url={article.coverImage} alt={article.coverAlt} />
        </DetailItem>
        <DetailItem label="Fotos na galeria">{article._count.gallery}</DetailItem>
        <DetailItem label="Título para buscadores">{article.metaTitle}</DetailItem>
        <DetailItem label="Descrição para buscadores">{article.metaDescription}</DetailItem>
        <DetailItem label="Corpo" wide>
          <BodyPreview html={article.body} />
        </DetailItem>
      </DetailGrid>

      <DetailActions editHref={`${BASE}/${article.id}/editar`}>
        <DeleteButton id={article.id} action={deleteArticle} variant="button" redirectTo={BASE} />
      </DetailActions>
    </>
  );
}
