import { notFound } from "next/navigation";
import { VideoForm } from "@/components/admin/VideoForm";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [video, events, articles, properties, categories] = await Promise.all([
    prisma.video.findUnique({ where: { id }, include: { categories: true } }),
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

  if (!video) notFound();

  return (
    <>
      <AdminHeading title="Editar vídeo" description={video.title} />
      <VideoForm
        events={events}
        articles={articles}
        properties={properties}
        categories={categories}
        video={{
          id: video.id,
          title: video.title,
          slug: video.slug,
          description: video.description,
          externalUrl: video.externalUrl,
          customThumbnail: video.customThumbnail,
          vertical: video.vertical,
          articleId: video.articleId,
          propertyId: video.propertyId,
          eventId: video.eventId,
          featured: video.featured,
          status: video.status,
          categoryIds: video.categories.map((category) => category.id),
        }}
      />
    </>
  );
}
