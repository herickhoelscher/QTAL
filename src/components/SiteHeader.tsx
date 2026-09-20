"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type NavItem = { label: string; href: string; children?: NavItem[] };

type Props = {
  siteName: string;
  logoUrl?: string | null;
  nav: NavItem[];
  subscribeHref: string;
  /** Barra de dados automaticos, renderizada no servidor e embutida aqui. */
  dataBar: ReactNode;
  /** Faixa escura de redes sociais acima do header (desktop). */
  utilityBar?: ReactNode;
};

/**
 * Pilha fixa do topo: header + barra de dados.
 * Sobre o heroi da home ela e transparente; ao rolar (ou em qualquer outra
 * rota) vira solida. O estado e publicado em data-topbar, e a barra de dados
 * se adapta por CSS — assim o componente de dados continua sendo server-side.
 */
export function SiteHeader({ siteName, logoUrl, nav, subscribeHref, dataBar, utilityBar }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const solid = scrolled || !isHome || menuOpen;

  return (
    <>
      <div
        data-topbar={solid ? "solid" : "transparent"}
        className={
          "sticky top-0 z-50 transition-colors duration-300 " +
          (solid ? "bg-surface" : "bg-transparent")
        }
      >
        {utilityBar}
        <header className="container-portal flex h-16 items-center justify-between gap-4 md:h-20">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
            className={
              "eyebrow flex items-center gap-2 transition-colors " +
              (solid ? "text-ink" : "text-white")
            }
          >
            <span aria-hidden className="flex flex-col gap-[3px]">
              <span className="block h-px w-5 bg-current" />
              <span className="block h-px w-5 bg-current" />
              <span className="block h-px w-5 bg-current" />
            </span>
            <span className="hidden sm:inline">Menu</span>
          </button>

          <Link
            href="/"
            className={
              "font-display text-xl tracking-tight transition-colors md:text-2xl " +
              (solid ? "text-ink" : "text-white")
            }
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} className="h-8 w-auto md:h-9" />
            ) : (
              <span className="italic">{siteName}</span>
            )}
          </Link>

          <Link
            href={subscribeHref}
            className={
              "eyebrow rounded-full border px-4 py-2 transition-colors " +
              (solid
                ? "border-brand bg-brand text-white hover:bg-brand-dark"
                : "border-white/70 text-white hover:bg-white hover:text-ink")
            }
          >
            Assine
          </Link>
        </header>

        {dataBar}
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="menu-principal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-60 bg-surface"
          >
            <div className="container-portal flex h-16 items-center justify-end md:h-20">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="eyebrow text-muted hover:text-ink"
                autoFocus
              >
                Fechar &#10005;
              </button>
            </div>

            <nav className="container-portal flex h-[calc(100dvh-5rem)] flex-col justify-center overflow-y-auto pb-16">
              <ul className="space-y-1">
                {nav.map((item, index) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * index, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="font-display text-4xl leading-tight italic hover:text-brand md:text-6xl"
                    >
                      {item.label}
                    </Link>
                    {item.children?.length ? (
                      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 pb-2">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setMenuOpen(false)}
                              className="eyebrow text-muted hover:text-brand"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
