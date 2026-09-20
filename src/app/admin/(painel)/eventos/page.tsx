import Link from "next/link";
import { deleteEvent } from "@/app/admin/actions/content";
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

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string }>;
}) {
  const { salvo } = await searchParams;

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { media: true, videos: true } } },
  });

  return (
    <>
      <AdminHeading
        title="Eventos"
        description="Cobertura fotográfica e agenda."
        action={{ href: "/admin/eventos/novo", label: "Novo evento" }}
      />
      <SavedNotice show={salvo === "1"} />

      {events.length ? (
        <AdminTable headers={["Evento", "Status", "Data", "Fotos", "Vídeos", ""]}>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <p className="font-semibold">{event.title}</p>
                <p className="text-xs text-muted">
                  {[event.location, event.region].filter(Boolean).join(" · ") || "—"}
                </p>
              </td>
              <td className="px-4 py-3">
                <StatusPill status={event.status} />
              </td>
              <td className="px-4 py-3 text-muted">{formatDateShort(event.date)}</td>
              <td className="px-4 py-3 tabular-nums">{event._count.media}</td>
              <td className="px-4 py-3 tabular-nums">{event._count.videos}</td>
              <td className="px-4 py-3">
                <div className="flex gap-4">
                  <Link href={"/admin/eventos/" + event.id} className="text-brand hover:underline">
                    Editar
                  </Link>
                  <DeleteButton id={event.id} action={deleteEvent} />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <AdminEmpty>Nenhum evento cadastrado ainda.</AdminEmpty>
      )}
    </>
  );
}
