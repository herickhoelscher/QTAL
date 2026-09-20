import Link from "next/link";
import { deleteProperty } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  AdminEmpty,
  AdminHeading,
  AdminTable,
  SavedNotice,
  StatusPill,
} from "@/components/admin/ui";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string }>;
}) {
  const { salvo } = await searchParams;
  const properties = await prisma.property.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <>
      <AdminHeading
        title="Imóveis"
        description="Vitrine de casas, apartamentos, terrenos e salas comerciais."
        action={{ href: "/admin/imoveis/novo", label: "Novo imóvel" }}
      />
      <SavedNotice show={salvo === "1"} />

      {properties.length ? (
        <AdminTable headers={["Imóvel", "Status", "Cidade", "Tipo", "Valor", ""]}>
          {properties.map((property) => (
            <tr key={property.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-semibold">{property.title}</td>
              <td className="px-4 py-3">
                <StatusPill status={property.status} />
              </td>
              <td className="px-4 py-3 text-muted">{property.city}</td>
              <td className="px-4 py-3 text-muted">{property.type}</td>
              <td className="px-4 py-3">
                {property.priceOnRequest
                  ? "Sob consulta"
                  : formatCurrency(property.price?.toString())}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-4">
                  <Link href={"/admin/imoveis/" + property.id} className="text-brand hover:underline">
                    Editar
                  </Link>
                  <DeleteButton id={property.id} action={deleteProperty} />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <AdminEmpty>Nenhum imóvel cadastrado ainda.</AdminEmpty>
      )}
    </>
  );
}
