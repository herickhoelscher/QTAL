"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminRole } from "@prisma/client";

const LINKS: { href: string; label: string; adminOnly?: boolean }[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/materias", label: "Matérias" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/imoveis", label: "Imóveis" },
  { href: "/admin/videos", label: "Vídeos" },
  { href: "/admin/edicoes", label: "Edições (Modo Revista)" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/configuracoes", label: "Configurações", adminOnly: true },
  { href: "/admin/usuarios", label: "Usuários", adminOnly: true },
];

export function AdminNav({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const links = LINKS.filter((link) => !link.adminOnly || role === "ADMIN");

  return (
    <nav aria-label="Seções do painel" className="lg:w-56 lg:shrink-0">
      <ul className="flex flex-wrap gap-1 lg:flex-col">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  "block border-l-2 px-3 py-2 text-sm transition-colors " +
                  (active
                    ? "border-brand bg-surface font-semibold text-brand"
                    : "border-transparent text-muted hover:border-line hover:text-ink")
                }
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
