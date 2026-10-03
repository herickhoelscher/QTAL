import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin/dashboard");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-page px-4 py-16">
      <div className="w-full max-w-[336px] rounded-3xl bg-surface p-6 shadow-[0_18px_50px_-12px_rgba(15,23,42,0.28)]">
        <h1 className="text-2xl font-extrabold text-ink">Entrar</h1>
        <p className="mt-1 text-xs text-muted">Acesse a área administrativa com suas credenciais.</p>
        <LoginForm />
      </div>
    </main>
  );
}
