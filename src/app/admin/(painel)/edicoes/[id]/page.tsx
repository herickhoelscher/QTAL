import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteIssue } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { FlipbookReader } from "@/components/FlipbookReader";
import {
  CoverPreview,
  DetailActions,
  DetailGrid,
  DetailHeading,
  DetailItem,
} from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { flipPages } from "@/lib/issue-cover";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site-url";

const BASE = "/admin/edicoes";

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const settings = await getSettings();
  const issue = await prisma.issue.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: { article: { select: { id: true, title: true } } },
      },
      pages: { orderBy: { position: "asc" }, select: { url: true, altText: true } },
    },
  });
  if (!issue) notFound();

  // Com paginas, a edicao abre no leitor folheavel; sem, direto no Modo Revista.
  const path = (issue.pages.length ? "/edicoes/" : "/modo-revista/") + issue.slug;
  const pages = flipPages(issue, settings);

  return (
    <>
      <DetailHeading
        title={issue.title}
        subtitle="Detalhes de edição"
        backHref={BASE}
        open={
          issue.status === "PUBLISHED"
            ? { href: path, label: "Abrir edição" }
            : undefined
        }
      />

      <DetailGrid>
        <DetailItem label="Título">{issue.title}</DetailItem>
        <DetailItem label="Status">{issue.status === "PUBLISHED" ? "Publicado" : "Rascunho"}</DetailItem>
        <DetailItem label="Endereço da página">{path}</DetailItem>
        <DetailItem label="Publicado em">
          {issue.publishedAt ? formatDateTime(issue.publishedAt) : null}
        </DetailItem>
        <DetailItem label="Descrição" wide>
          {issue.description}
        </DetailItem>
        <DetailItem label="Título da capa">{issue.coverTitle}</DetailItem>
        <DetailItem label="Subtítulo da capa">{issue.coverSubtitle}</DetailItem>
        <DetailItem label="Foto da capa" wide>
          <CoverPreview url={issue.coverImage} />
        </DetailItem>
        <DetailItem label={`Matérias da edição (${issue.items.length})`} wide>
          {issue.items.length ? (
            <ol className="list-decimal space-y-1 pl-5">
              {issue.items.map((item) => (
                <li key={item.id}>
                  <Link href={"/admin/materias/" + item.article.id} className="text-link hover:underline">
                    {item.article.title}
                  </Link>
                </li>
              ))}
            </ol>
          ) : null}
        </DetailItem>
      </DetailGrid>

      {pages.length ? (
        <section className="mt-8">
          <h2 className="text-base font-bold text-ink">
            Prévia do leitor ({pages.length} páginas)
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Como a revista folheia no site. Funciona também em rascunho, antes de publicar.
          </p>
          <div className="mt-4 rounded-2xl bg-[#1b1d22] px-4 py-8 text-white md:px-8">
            <FlipbookReader
              title={issue.title}
              shareUrl={SITE_URL + path}
              pages={pages}
            />
          </div>
        </section>
      ) : null}

      <DetailActions editHref={`${BASE}/${issue.id}/editar`}>
        <DeleteButton id={issue.id} action={deleteIssue} variant="button" redirectTo={BASE} />
      </DetailActions>
    </>
  );
}
