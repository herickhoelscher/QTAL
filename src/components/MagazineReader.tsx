"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type MagazinePage = {
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  image: string | null;
  html: string;
};

type Props = {
  issueTitle: string;
  pages: MagazinePage[];
};

const SWIPE_THRESHOLD = 60;
const NAV_COOLDOWN = 650;

/**
 * Modo Revista (secao 6.2): leitura sequencial em tela cheia.
 * Navega por setas do teclado, roda do mouse, swipe no touch e setas laterais.
 * A roda do mouse so troca de tela quando o texto ja esta no topo ou no fim,
 * para nao sequestrar a leitura de materias longas.
 */
export function MagazineReader({ issueTitle, pages }: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const lastNav = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);

  const total = pages.length;

  const goTo = useCallback(
    (next: number, dir: number) => {
      const now = Date.now();
      if (now - lastNav.current < NAV_COOLDOWN) return;
      if (next < 0 || next >= total) return;
      lastNav.current = now;
      setDirection(dir);
      setIndex(next);
      contentRef.current?.scrollTo({ top: 0 });
    },
    [total],
  );

  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const previous = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") next();
      if (event.key === "ArrowLeft" || event.key === "PageUp") previous();
      if (event.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous, router]);

  const onWheel = (event: React.WheelEvent) => {
    const pane = contentRef.current;
    if (!pane) return;
    const atTop = pane.scrollTop <= 2;
    const atBottom = pane.scrollTop + pane.clientHeight >= pane.scrollHeight - 2;
    if (event.deltaY > 12 && atBottom) next();
    if (event.deltaY < -12 && atTop) previous();
  };

  const page = pages[index];
  if (!page) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink text-white"
      onWheel={onWheel}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        const end = event.changedTouches[0]?.clientX;
        if (start == null || end == null) return;
        const delta = start - end;
        if (delta > SWIPE_THRESHOLD) next();
        if (delta < -SWIPE_THRESHOLD) previous();
        touchStart.current = null;
      }}
    >
      <header className="flex shrink-0 items-center justify-between gap-4 px-5 py-4 md:px-8">
        <p className="eyebrow text-white/60">
          Modo Revista &middot; {issueTitle}
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="eyebrow text-white/80 transition-colors hover:text-white"
          aria-label="Sair do Modo Revista"
        >
          Sair &#10005;
        </button>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.article
            key={page.slug}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid h-full md:grid-cols-[45%_1fr]"
          >
            <div className="relative hidden bg-black md:block">
              {page.image ? (
                <Image
                  src={page.image}
                  alt=""
                  fill
                  sizes="45vw"
                  priority
                  className="object-cover"
                />
              ) : null}
            </div>

            <div ref={contentRef} className="overflow-y-auto px-5 py-8 md:px-14 md:py-12">
              <div className="mx-auto max-w-2xl">
                {page.image ? (
                  <div className="relative mb-6 aspect-[16/10] w-full md:hidden">
                    <Image
                      src={page.image}
                      alt=""
                      fill
                      sizes="100vw"
                      priority
                      className="object-cover"
                    />
                  </div>
                ) : null}

                {page.category ? (
                  <p className="eyebrow text-accent">{page.category}</p>
                ) : null}
                <h1 className="mt-3 font-display text-3xl leading-tight italic md:text-5xl">
                  {page.title}
                </h1>
                {page.subtitle ? (
                  <p className="mt-4 text-lg text-white/70">{page.subtitle}</p>
                ) : null}

                <div
                  className="prose-editorial prose-invert mt-8 text-white/90"
                  dangerouslySetInnerHTML={{ __html: page.html }}
                />

                <a
                  href={"/materias/" + page.slug}
                  className="eyebrow mt-10 inline-block border-b border-accent pb-1 text-accent"
                >
                  Abrir matéria completa &rarr;
                </a>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>

        <button
          type="button"
          onClick={previous}
          disabled={index === 0}
          aria-label="Página anterior"
          className="absolute top-1/2 left-2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 disabled:opacity-20 md:flex"
        >
          &#8592;
        </button>
        <button
          type="button"
          onClick={next}
          disabled={index === total - 1}
          aria-label="Próxima página"
          className="absolute top-1/2 right-2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 disabled:opacity-20 md:flex"
        >
          &#8594;
        </button>
      </div>

      <footer className="flex shrink-0 items-center justify-center gap-3 px-5 py-5">
        <span className="eyebrow text-white/50 tabular-nums">
          {index + 1} / {total}
        </span>
        <div className="flex items-center gap-2">
          {pages.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => goTo(i, i > index ? 1 : -1)}
              aria-label={"Ir para a página " + (i + 1)}
              aria-current={i === index}
              className={
                "h-2 rounded-full transition-all " +
                (i === index ? "w-8 bg-accent" : "w-2 bg-white/30 hover:bg-white/60")
              }
            />
          ))}
        </div>
      </footer>
    </div>
  );
}
