import Link from "next/link";
import { deleteArticle } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  AdminEmpty,
  AdminHeading,
  AdminTable,
  SavedNotice,
  StatusPill,
} from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/format";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string }>;
}) {
  const { salvo } = await searchParams;

  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { categories: true, author: { select: { name: true } } },
  });

  return (
    <>
      <AdminHeading
        title="Matérias"
        description="Reportagens e colunas publicadas no site."
        action={{ href: "/admin/materias/novo", label: "Nova matéria" }}
      />
      <SavedNotice show={salvo === "1"} />

      {articles.length ? (
        <AdminTable headers={["Título", "Status", "Categorias", "Visualizações", "Atualizada", ""]}>
          {articles.map((article) => (
            <tr key={article.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <p className="font-semibold">{article.title}</p>
                <p className="text-xs text-muted">
                  {article.author ? "por " + article.author.name : "sem autor"}
                </p>
              </td>
              <td className="px-4 py-3">
                <StatusPill status={article.status} />
              </td>
              <td className="px-4 py-3 text-muted">
                {article.categories.map((category) => category.name).join(", ") || "—"}
              </td>
              <td className="px-4 py-3 tabular-nums">{article.viewCount}</td>
              <td className="px-4 py-3 text-muted">{formatDateShort(article.updatedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex gap-4">
                  <Link href={"/admin/materias/" + article.id} className="text-brand hover:underline">
                    Editar
                  </Link>
                  <DeleteButton id={article.id} action={deleteArticle} />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <AdminEmpty>Nenhuma matéria cadastrada ainda.</AdminEmpty>
      )}
    </>
  );
}
