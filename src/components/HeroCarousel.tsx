"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type HeroSlide = {
  title: string;
  subtitle?: string | null;
  href: string;
  image?: string | null;
  category?: string | null;
};

/** Heroi full-bleed da home: imagem grande, overlay escuro e titulo editorial. */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const total = slides.length;

  const go = useCallback(
    (next: number) => setIndex(((next % total) + total) % total),
    [total],
  );

  useEffect(() => {
    if (total < 2) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = setInterval(() => setIndex((current) => (current + 1) % total), 7000);
    return () => clearInterval(id);
  }, [total]);

  if (!total) return null;
  const slide = slides[index];

  return (
    <section className="hero-under-topbar relative h-[88vh] min-h-[560px] w-full overflow-hidden bg-ink">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {slide.image ? (
            /* Zoom lento (Ken Burns) enquanto o slide esta no ar: da vida a uma
               foto parada sem competir com a leitura do titulo. */
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "linear" }}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                priority
                quality={90}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30" />
        </motion.div>
      </AnimatePresence>

      <div className="relative flex h-full items-end pb-16 md:pb-24">
        <div className="container-portal">
          <motion.div
            key={"copy-" + index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]"
          >
            {slide.category ? (
              <p className="eyebrow text-white/80">{slide.category}</p>
            ) : null}
            <h1 className="mt-3 max-w-[15ch] font-display text-[2.6rem] leading-[1.02] font-bold italic md:text-6xl lg:text-[4.5rem]">
              {slide.title}
            </h1>
            {slide.subtitle ? (
              <p className="mt-4 max-w-xl text-base text-white/85 md:text-lg">{slide.subtitle}</p>
            ) : null}
            <Link
              href={slide.href}
              className="eyebrow mt-8 inline-flex items-center gap-2 border-b border-white pb-1 transition-colors hover:border-accent hover:text-accent"
            >
              Ler mais &rarr;
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Indicador em tracos, centralizado no rodape do heroi — o padrao da
          referencia editorial, menos "carrossel de e-commerce" que bolinhas. */}
      {total > 1 ? (
        <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-2">
          {slides.map((item, i) => (
            <button
              key={item.href}
              type="button"
              onClick={() => go(i)}
              aria-label={"Ir para o destaque " + (i + 1)}
              aria-current={i === index}
              className="group px-1 py-3"
            >
              <span
                className={
                  "block h-px transition-all duration-500 " +
                  (i === index ? "w-10 bg-white" : "w-5 bg-white/45 group-hover:bg-white/80")
                }
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
