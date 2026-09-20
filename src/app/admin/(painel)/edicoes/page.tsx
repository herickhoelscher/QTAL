import Link from "next/link";
import { deleteIssue } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  AdminEmpty,
  AdminHeading,
  AdminTable,
  SavedNotice,
  StatusPill,
} from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function AdminIssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string }>;
}) {
  const { salvo } = await searchParams;

  const issues = await prisma.issue.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <>
      <AdminHeading
        title="Edições (Modo Revista)"
        description="Cada edição é uma sequência de matérias folheada em tela cheia."
        action={{ href: "/admin/edicoes/novo", label: "Nova edição" }}
      />
      <SavedNotice show={salvo === "1"} />

      {issues.length ? (
        <AdminTable headers={["Edição", "Status", "Matérias", "Endereço", ""]}>
          {issues.map((issue) => (
            <tr key={issue.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-semibold">{issue.title}</td>
              <td className="px-4 py-3">
                <StatusPill status={issue.status} />
              </td>
              <td className="px-4 py-3 tabular-nums">{issue._count.items}</td>
              <td className="px-4 py-3 text-muted">
                <Link href={"/modo-revista/" + issue.slug} className="hover:text-brand">
                  /modo-revista/{issue.slug}
                </Link>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-4">
                  <Link href={"/admin/edicoes/" + issue.id} className="text-brand hover:underline">
                    Editar
                  </Link>
                  <DeleteButton id={issue.id} action={deleteIssue} />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <AdminEmpty>Nenhuma edição montada ainda.</AdminEmpty>
      )}
    </>
  );
}
