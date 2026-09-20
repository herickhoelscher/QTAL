"use client";

import { useState } from "react";
import { VideoThumb } from "@/components/VideoThumb";

/**
 * O iframe so entra no DOM depois do clique: mantem o usuario dentro do site
 * (requisito da reuniao) sem carregar o player do YouTube/Instagram no first
 * paint, o que protege o LCP da pagina.
 */
export function LazyEmbed({
  embedSrc,
  embedId,
  thumbnail,
  title,
  vertical = false,
}: {
  embedSrc: string;
  /** Id no provedor: usado para buscar a capa em alta antes do clique. */
  embedId: string;
  thumbnail?: string | null;
  title: string;
  vertical?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const ratio = vertical ? "aspect-[9/16]" : "aspect-video";

  if (playing) {
    return (
      <div className={"relative w-full overflow-hidden bg-black " + ratio}>
        <iframe
          src={embedSrc}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={"group relative block w-full overflow-hidden bg-ink " + ratio}
      aria-label={"Reproduzir: " + title}
    >
      <VideoThumb
        embedId={embedId}
        custom={thumbnail}
        alt=""
        priority
        sizes="(max-width: 1024px) 100vw, 900px"
        className="object-cover opacity-85 transition-opacity group-hover:opacity-100"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white transition-transform duration-300 group-hover:scale-110">
          <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
