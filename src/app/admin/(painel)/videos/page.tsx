import Link from "next/link";
import { deleteVideo } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  AdminEmpty,
  AdminHeading,
  AdminTable,
  SavedNotice,
  StatusPill,
} from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { providerLabel } from "@/lib/video";

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string }>;
}) {
  const { salvo } = await searchParams;

  const videos = await prisma.video.findMany({
    orderBy: { updatedAt: "desc" },
    include: { event: { select: { title: true } } },
  });

  return (
    <>
      <AdminHeading
        title="Vídeos"
        description="Todos hospedados fora do site: aqui entra apenas o link."
        action={{ href: "/admin/videos/novo", label: "Novo vídeo" }}
      />
      <SavedNotice show={salvo === "1"} />

      {videos.length ? (
        <AdminTable headers={["Vídeo", "Status", "Origem", "Evento", ""]}>
          {videos.map((video) => (
            <tr key={video.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-semibold">{video.title}</td>
              <td className="px-4 py-3">
                <StatusPill status={video.status} />
              </td>
              <td className="px-4 py-3 text-muted">{providerLabel(video.provider)}</td>
              <td className="px-4 py-3 text-muted">{video.event?.title ?? "—"}</td>
              <td className="px-4 py-3">
                <div className="flex gap-4">
                  <Link href={"/admin/videos/" + video.id} className="text-brand hover:underline">
                    Editar
                  </Link>
                  <DeleteButton id={video.id} action={deleteVideo} />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <AdminEmpty>Nenhum vídeo cadastrado ainda.</AdminEmpty>
      )}
    </>
  );
}
