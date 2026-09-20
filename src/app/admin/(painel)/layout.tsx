import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "@/app/admin/actions/auth";
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
    <div className="flex min-h-dvh flex-col bg-surface-alt">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            {settings.clientLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.clientLogoUrl} alt={settings.siteName} className="h-8 w-auto" />
            ) : (
              <span className="font-display text-xl italic">{settings.siteName}</span>
            )}
            <span className="h-6 w-px bg-line" aria-hidden />
            <span className="eyebrow text-muted">BSEC</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" className="eyebrow text-muted hover:text-brand">
              Ver o site
            </Link>
            <span className="hidden text-sm text-muted sm:inline">{session.name}</span>
            <form action={logout}>
              <button type="submit" className="eyebrow text-brand hover:underline">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8 lg:flex-row">
        <AdminNav role={session.role} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
