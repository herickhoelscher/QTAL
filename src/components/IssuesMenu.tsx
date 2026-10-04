"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/LocalizedLink";
import { IssueCoverArt } from "@/components/IssueCover";
import { useI18n } from "@/components/I18nProvider";
import type { CoverText } from "@/lib/issue-cover";

export type MenuIssue = {
  slug: string;
  title: string;
  image: string | null;
  coverText: CoverText | null;
  /** Ja formatada no idioma da pagina ("outubro de 2026"). */
  date: string | null;
};

/**
 * Botao "Todas as edicoes" do leitor: abre um painel com as capas de todas
 * as edicoes publicadas, a atual marcada. Fecha com Esc ou clicando fora.
 */
export function IssuesMenu({ issues, current }: { issues: MenuIssue[]; current: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="menu-edicoes"
        className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-white backdrop-blur transition-colors hover:bg-white hover:text-ink"
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
        </svg>
        {t.issues.allIssues} ({issues.length})
      </button>

      {open ? (
        <div
          id="menu-edicoes"
          className="absolute right-0 top-full z-30 mt-3 max-h-[70vh] w-[min(92vw,760px)] overflow-y-auto rounded-xl bg-white p-5 text-ink shadow-2xl"
        >
          <p className="eyebrow text-brand">{t.issues.allIssues}</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
            {issues.map((issue) => {
              const isCurrent = issue.slug === current;
              return (
                <li key={issue.slug}>
                  <Link
                    href={"/edicoes/" + issue.slug}
                    aria-current={isCurrent ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="group block"
                  >
                    <span className="block">
                      <IssueCoverArt
                        image={issue.image}
                        text={issue.coverText}
                        sizes="180px"
                        className={
                          "rounded-md shadow-md transition-transform duration-300 group-hover:-translate-y-1 " +
                          (isCurrent ? "ring-3 ring-brand ring-offset-2" : "")
                        }
                      />
                    </span>
                    {isCurrent ? (
                      <span className="eyebrow mt-2 block text-[10px] text-brand">{t.issues.readingNow}</span>
                    ) : null}
                    <span className={(isCurrent ? "mt-0.5" : "mt-2") + " block text-sm font-semibold leading-snug group-hover:text-brand"}>
                      {issue.title}
                    </span>
                    {issue.date ? (
                      <span className="block text-xs text-muted">{issue.date}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
