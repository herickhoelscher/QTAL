import { EventForm } from "@/components/admin/EventForm";
import { AdminHeading } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

export default async function NewEventPage() {
  const categories = await prisma.category.findMany({
    where: { type: "EVENT" },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <AdminHeading title="Novo Evento" description="Use este formulário para gerenciar o registro." />
      <EventForm categories={categories} />
    </>
  );
}
