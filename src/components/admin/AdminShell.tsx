"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { AdminRole } from "@prisma/client";
import { logout } from "@/app/admin/actions/auth";
import { ROLE_LABEL } from "@/components/admin/labels";
import { ThemeToggle } from "@/components/admin/ThemeToggle";

const LINKS: { href: string; label: string; adminOnly?: boolean }[] = [
  { href: "/admin/dashboard", label: "Painel" },
  { href: "/admin/carrossel", label: "Carrossel" },
  { href: "/admin/materias", label: "Matérias" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/imoveis", label: "Imóveis" },
  { href: "/admin/videos", label: "Vídeos" },
  { href: "/admin/edicoes", label: "Edições" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/usuarios", label: "Usuários", adminOnly: true },
  { href: "/admin/configuracoes", label: "Configurações", adminOnly: true },
];

type Props = {
  user: { id: string; name: string; role: AdminRole };
  siteName: string;
  logoUrl: string | null;
  children: ReactNode;
};

/**
 * Moldura do painel: barra superior escura com a marca B7, menu lateral com o
 * logo do cliente e a chave do tema escuro. No celular o menu vira gaveta.
 */
export function AdminShell({ user, siteName, logoUrl, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const links = LINKS.filter((link) => !link.adminOnly || user.role === "ADMIN");

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex min-h-[136px] items-center justify-center border-b border-white/10 px-6 py-6">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={siteName} className="max-h-24 w-auto max-w-[180px] object-contain" />
        ) : (
          <span className="text-center text-lg font-extrabold text-white">{siteName}</span>
        )}
      </div>

      <nav aria-label="Seções do painel" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="grid gap-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={
                    "block rounded-lg px-4 py-2.5 text-sm transition-colors " +
                    (active
                      ? "bg-chrome-active font-semibold text-white"
                      : "text-white/85 hover:bg-white/5 hover:text-white")
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li className="mt-2 border-t border-white/10 pt-2">
            <Link
              href="/"
              target="_blank"
              className="block rounded-lg px-4 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              Ver o site ↗
            </Link>
          </li>
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-chrome px-4 md:h-[72px] md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls="menu-painel"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Link href="/admin/dashboard" className="text-xl font-black tracking-tight text-white">
            B7 MÍDIA
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white sm:flex">
            {user.name}
            <span aria-hidden className="text-white/40">•</span>
            <span className="text-xs font-normal text-white/70">{ROLE_LABEL[user.role]}</span>
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-[72px] hidden h-[calc(100dvh-72px)] w-[290px] shrink-0 bg-chrome lg:block">
          {sidebar}
        </aside>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu do painel">
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/50"
            />
            <aside id="menu-painel" className="relative h-full w-[280px] max-w-[85vw] bg-chrome shadow-2xl">
              {sidebar}
            </aside>
          </div>
        ) : null}

        <main className="min-w-0 flex-1">
          <div aria-hidden className="h-8 border-b border-line" />
          <div className="mx-auto w-full max-w-[1240px] px-4 py-8 md:px-10 md:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
