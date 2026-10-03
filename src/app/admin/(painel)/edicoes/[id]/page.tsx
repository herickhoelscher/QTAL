import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteIssue } from "@/app/admin/actions/content";
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

const BASE = "/admin/edicoes";

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = await prisma.issue.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: { article: { select: { id: true, title: true } } },
      },
    },
  });
  if (!issue) notFound();

  return (
    <>
      <DetailHeading
        title={issue.title}
        subtitle="Detalhes de edição"
        backHref={BASE}
        open={
          issue.status === "PUBLISHED"
            ? { href: "/modo-revista/" + issue.slug, label: "Abrir edição" }
            : undefined
        }
      />

      <DetailGrid>
        <DetailItem label="Título">{issue.title}</DetailItem>
        <DetailItem label="Status">{issue.status === "PUBLISHED" ? "Publicado" : "Rascunho"}</DetailItem>
        <DetailItem label="Endereço da página">/modo-revista/{issue.slug}</DetailItem>
        <DetailItem label="Publicado em">
          {issue.publishedAt ? formatDateTime(issue.publishedAt) : null}
        </DetailItem>
        <DetailItem label="Descrição" wide>
          {issue.description}
        </DetailItem>
        <DetailItem label="Capa" wide>
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

      <DetailActions editHref={`${BASE}/${issue.id}/editar`}>
        <DeleteButton id={issue.id} action={deleteIssue} variant="button" redirectTo={BASE} />
      </DetailActions>
    </>
  );
}
