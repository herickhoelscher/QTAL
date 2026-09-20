"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type FeedVideo = {
  slug: string;
  title: string;
  description: string | null;
  provider: "YOUTUBE" | "INSTAGRAM";
  embedId: string;
  externalUrl: string;
  thumbnail: string | null;
  /** 9:16 (Reels/Shorts): ocupa a tela toda em vez de entrar com tarja. */
  vertical: boolean;
  eventTitle: string | null;
  eventSlug: string | null;
};

type Props = {
  videos: FeedVideo[];
  startIndex?: number;
};

/**
 * Feed vertical de vídeos, no formato que as pessoas já conhecem de Reels e
 * TikTok: uma tela por vídeo, rolagem com encaixe (scroll-snap), som desligado
 * na entrada e reprodução automática só do vídeo visível.
 *
 * O encaixe e o gesto de arrastar são nativos do navegador (scroll-snap), o que
 * dá inércia correta no celular sem nenhuma biblioteca. Só o vídeo ativo e os
 * vizinhos imediatos viram iframe — os demais ficam como imagem, senão o feed
 * carregaria dezenas de players de uma vez.
 */
export function VideoFeed({ videos, startIndex = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(startIndex);
  const [muted, setMuted] = useState(true);
  const [copied, setCopied] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  // Posiciona no vídeo escolhido sem animar, para a entrada não parecer um salto.
  useEffect(() => {
    const target = slideRefs.current[startIndex];
    if (target) target.scrollIntoView({ block: "start", behavior: "auto" });
  }, [startIndex]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(index)) setActive(index);
          }
        }
      },
      { threshold: [0.6] },
    );

    for (const slide of slideRefs.current) {
      if (slide) observer.observe(slide);
    }
    return () => observer.disconnect();
  }, [videos.length]);

  const goTo = useCallback((index: number) => {
    const target = slideRefs.current[index];
    if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        goTo(Math.min(active + 1, videos.length - 1));
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        goTo(Math.max(active - 1, 0));
      }
      if (event.key === "m") setMuted((current) => !current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo, videos.length]);

  const share = async (video: FeedVideo) => {
    const link = siteUrl + "/videos/" + video.slug;
    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, url: link });
        return;
      } catch {
        // menu nativo cancelado: segue para a cópia do link
      }
    }
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function embedSrc(video: FeedVideo, isActive: boolean) {
    if (video.provider === "INSTAGRAM") {
      return "https://www.instagram.com/p/" + video.embedId + "/embed";
    }
    const params = new URLSearchParams({
      autoplay: isActive ? "1" : "0",
      mute: muted ? "1" : "0",
      controls: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      loop: "1",
      playlist: video.embedId,
    });
    return "https://www.youtube-nocookie.com/embed/" + video.embedId + "?" + params;
  }

  if (!videos.length) return null;

  return (
    <div
      ref={containerRef}
      className="h-dvh w-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain bg-black"
      style={{ scrollbarWidth: "none" }}
    >
      {videos.map((video, index) => {
        // Renderiza o player do vídeo ativo e dos vizinhos; o resto fica em capa.
        const mounted = Math.abs(index - active) <= 1;
        const isActive = index === active;

        return (
          <section
            key={video.slug}
            data-index={index}
            ref={(element) => {
              slideRefs.current[index] = element;
            }}
            className="relative flex h-dvh w-full snap-start snap-always items-center justify-center overflow-hidden"
            aria-label={video.title}
          >
            {/* Fundo desfocado da própria capa: preenche a tela vertical sem
                cortar o vídeo 16:9 nem deixar tarjas pretas vazias. */}
            {video.thumbnail ? (
              <Image
                src={video.thumbnail}
                alt=""
                fill
                sizes="100vw"
                aria-hidden
                className="scale-110 object-cover blur-2xl brightness-50"
              />
            ) : null}

            {/* Vídeo vertical preenche a tela, como em qualquer feed de Reels.
                O deitado entra na maior largura que a altura comporta em 16:9,
                com a capa desfocada preenchendo o resto — cortá-lo para forçar
                o retrato jogaria fora dois terços da imagem. */}
            {mounted ? (
              <div
                className={
                  "relative self-center " +
                  (video.vertical
                    ? "aspect-[9/16] h-dvh max-h-dvh w-auto max-w-full"
                    : "aspect-video w-full max-w-[calc(100dvh*16/9)]")
                }
              >
                <iframe
                  src={embedSrc(video, isActive)}
                  title={video.title}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            ) : video.thumbnail ? (
              <Image
                src={video.thumbnail}
                alt=""
                fill
                sizes="100vw"
                className={video.vertical ? "object-cover" : "object-contain"}
              />
            ) : null}

            {/* Faixas de contraste: o texto precisa sobreviver a qualquer frame. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

            {/* pr-20: reserva a faixa da trilha de ações, para o texto nunca passar por baixo dela. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 pr-20 pb-10 md:p-10 md:pr-28">
              <div className="pointer-events-auto max-w-2xl text-white">
                {video.eventTitle && video.eventSlug ? (
                  <Link
                    href={"/eventos/" + video.eventSlug}
                    className="eyebrow text-white/70 hover:text-white"
                  >
                    {video.eventTitle}
                  </Link>
                ) : null}
                <h2 className="mt-2 font-display text-2xl leading-tight italic md:text-4xl">
                  {video.title}
                </h2>
                {video.description ? (
                  <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/80 md:text-base">
                    {video.description}
                  </p>
                ) : null}
                <Link
                  href={"/videos/" + video.slug}
                  className="eyebrow mt-4 inline-block border-b border-white/60 pb-1 hover:border-accent hover:text-accent"
                >
                  Abrir p&aacute;gina do v&iacute;deo
                </Link>
              </div>
            </div>

            {/* Barra de ações no padrão dos feeds verticais: ao alcance do polegar. */}
            <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4 md:right-8 md:bottom-32">
              <button
                type="button"
                onClick={() => setMuted((current) => !current)}
                aria-label={muted ? "Ativar som" : "Desativar som"}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30"
              >
                {muted ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3l3 3 1.5-1.5-3-3 3-3L19.5 6l-3 3-3-3L12 7.5l3 3-3 3 1.5 1.5 3-3z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 16 12zm-2-7.5v2.06a6 6 0 0 1 0 10.88v2.06a8 8 0 0 0 0-15z" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => share(video)}
                aria-label="Compartilhar"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                  <path d="M18 16a3 3 0 0 0-2.2 1l-7-4a3 3 0 0 0 0-2l7-4A3 3 0 1 0 15 5l-7 4a3 3 0 1 0 0 6l7 4A3 3 0 1 0 18 16z" />
                </svg>
              </button>

              <a
                href={video.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={
                  "Assistir no " + (video.provider === "YOUTUBE" ? "YouTube" : "Instagram")
                }
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
                  <path d="M14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7zM5 5h5V3H3v18h18v-7h-2v5H5V5z" />
                </svg>
              </a>

              <span className="eyebrow text-white/60 tabular-nums">
                {index + 1}/{videos.length}
              </span>
            </div>

            {index === 0 && active === 0 ? (
              <p className="pointer-events-none absolute inset-x-0 bottom-2 animate-pulse text-center text-xs text-white/70">
                Deslize para cima para o pr&oacute;ximo v&iacute;deo
              </p>
            ) : null}
          </section>
        );
      })}

      {copied ? (
        <p
          role="status"
          className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white px-5 py-2 text-sm text-ink"
        >
          Link copiado
        </p>
      ) : null}
    </div>
  );
}
