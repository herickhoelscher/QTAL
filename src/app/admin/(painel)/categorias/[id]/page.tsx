import { notFound } from "next/navigation";
import type { Category } from "@prisma/client";
import { deleteCategory } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { CATEGORY_TYPE_LABEL } from "@/components/admin/labels";
import { DetailActions, DetailGrid, DetailHeading, DetailItem } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";

const BASE = "/admin/categorias";

/** Onde a categoria aparece no site. Imoveis e videos nao tem pagina por categoria. */
function publicHref(category: Category): string | undefined {
  if (category.type === "ARTICLE") return "/materias/categoria/" + category.slug;
  if (category.type === "EVENT") return "/eventos?categoria=" + category.slug;
  return undefined;
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { articles: true, events: true, properties: true, videos: true } } },
  });
  if (!category) notFound();

  const href = publicHref(category);
  const { _count } = category;
  const items = _count.articles + _count.events + _count.properties + _count.videos;

  return (
    <>
      <DetailHeading
        title={category.name}
        subtitle="Detalhes de categoria"
        backHref={BASE}
        open={href ? { href, label: "Abrir categoria" } : undefined}
      />

      <DetailGrid>
        <DetailItem label="Nome">{category.name}</DetailItem>
        <DetailItem label="Tipo">{CATEGORY_TYPE_LABEL[category.type]}</DetailItem>
        <DetailItem label="Endereço">{category.slug}</DetailItem>
        <DetailItem label="Itens na categoria">{items}</DetailItem>
      </DetailGrid>

      <DetailActions editHref={`${BASE}/${category.id}/editar`}>
        <DeleteButton
          id={category.id}
          action={deleteCategory}
          variant="button"
          redirectTo={BASE}
          confirmMessage="Excluir esta categoria? Os itens dela continuam no site, só perdem a etiqueta."
        />
      </DetailActions>
    </>
  );
}
