"use client";

import Image from "next/image";
import Link from "@/components/LocalizedLink";
import { useRef } from "react";
import { useI18n } from "@/components/I18nProvider";
import { CoverOverlay } from "@/components/IssueCover";
import type { CoverText } from "@/lib/issue-cover";

export type ShelfIssue = {
  slug: string;
  title: string;
  cover: string | null;
  coverText: CoverText | null;
};

/**
 * Faixa "Edicoes anteriores" (padrao da DIFE): fundo vermelho de ponta a ponta,
 * capas em fila com setas redondas e o botao vazado para a pagina de edicoes.
 * A fila e uma rolagem horizontal com encaixe; as setas so rolam uma tela.
 */
export function IssuesShelf({
  issues,
  logoUrl,
  siteName,
}: {
  issues: ShelfIssue[];
  logoUrl: string | null;
  siteName: string;
}) {
  const { t } = useI18n();
  const track = useRef<HTMLUListElement>(null);

  function scroll(direction: -1 | 1) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.9, behavior: "smooth" });
  }

  const arrow = (direction: -1 | 1) => (
    <button
      type="button"
      onClick={() => scroll(direction)}
      aria-label={direction === -1 ? t.home.prevCovers : t.home.nextCovers}
      className={
        "absolute top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-brand text-white transition-colors hover:bg-white hover:text-brand sm:flex " +
        (direction === -1 ? "-left-4" : "-right-4")
      }
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d={direction === -1 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );

  return (
    <section className="bg-brand py-10 text-white md:py-12" aria-labelledby="edicoes-anteriores">
      <div className="container-portal">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={siteName} className="h-6 w-auto brightness-0 invert" />
        ) : (
          <p className="eyebrow text-white/80">{siteName}</p>
        )}
        <h2 id="edicoes-anteriores" className="mt-2 text-xl font-bold md:text-2xl">
          {t.home.pastIssues}
        </h2>

        <div className="relative mt-6">
          {arrow(-1)}
          <ul
            ref={track}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] md:gap-8 [&::-webkit-scrollbar]:hidden"
          >
            {issues.map((issue) => (
              <li
                key={issue.slug}
                className="w-[calc(50%-12px)] shrink-0 snap-start sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-24px)]"
              >
                <Link
                  href={"/edicoes/" + issue.slug}
                  className="group block"
                  aria-label={issue.title}
                >
                  <span className="relative block aspect-[3/4] overflow-hidden rounded-md bg-black/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
                    {issue.cover ? (
                      <Image
                        src={issue.cover}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : null}
                    {issue.coverText ? <CoverOverlay text={issue.coverText} /> : null}
                  </span>
                  <span className="mt-3 block text-sm font-semibold text-white/90 group-hover:text-white">
                    {issue.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {arrow(1)}
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/edicoes"
            className="eyebrow border border-white px-7 py-3 text-white transition-colors hover:bg-white hover:text-brand"
          >
            {t.home.allIssues}
          </Link>
        </div>
      </div>
    </section>
  );
}
