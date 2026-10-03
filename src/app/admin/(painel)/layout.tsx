import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Guarda definitiva do painel: nenhuma rota /admin/* renderiza sem sessao.
  const session = await getSession();
  if (!session) redirect("/admin");

  const settings = await getSettings();

  return (
    <AdminShell
      user={{ id: session.id, name: session.name, role: session.role }}
      siteName={settings.siteName}
      logoUrl={settings.clientLogoUrl}
    >
      {children}
    </AdminShell>
  );
}
