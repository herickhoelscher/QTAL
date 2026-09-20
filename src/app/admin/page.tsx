import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin/dashboard");

  const settings = await getSettings();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-alt px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-end justify-between gap-4">
          <p className="font-display text-2xl italic">{settings.siteName}</p>
          <p className="eyebrow text-muted">BSEC</p>
        </div>

        <div className="border border-line bg-surface p-8">
          <h1 className="font-display text-2xl">Entrar no painel</h1>
          <p className="mt-1 text-sm text-muted">
            Acesso restrito à equipe de redação.
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
