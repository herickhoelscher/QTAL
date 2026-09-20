import { VideoForm } from "@/components/admin/VideoForm";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function NewVideoPage() {
  const [events, articles, properties, categories] = await Promise.all([
    prisma.event.findMany({ orderBy: { date: "desc" }, select: { id: true, title: true } }),
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true },
    }),
    prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
    prisma.category.findMany({ where: { type: "VIDEO" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <AdminHeading title="Novo vídeo" />
      <VideoForm
        events={events}
        articles={articles}
        properties={properties}
        categories={categories}
      />
    </>
  );
}
