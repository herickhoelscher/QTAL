import type { VideoProvider } from "@prisma/client";

export type ParsedVideo = {
  provider: VideoProvider;
  embedId: string;
  /** Formato retrato (9:16), deduzido do tipo de link. */
  vertical: boolean;
};

/** Aceita youtu.be, watch?v=, /embed/, /shorts/ e permalinks do Instagram. */
export function parseVideoUrl(url: string): ParsedVideo | null {
  const clean = url.trim();

  const yt = clean.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i,
  );
  // Shorts e Reels sao sempre retrato; um /watch comum, quase sempre paisagem.
  // E so um palpite inicial: o painel deixa corrigir com uma caixa de selecao.
  if (yt) return { provider: "YOUTUBE", embedId: yt[1], vertical: /\/shorts\//i.test(clean) };

  const ig = clean.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  if (ig) {
    return {
      provider: "INSTAGRAM",
      embedId: ig[1],
      vertical: /\/(reel|tv)\//i.test(clean),
    };
  }

  return null;
}

export function embedUrl(provider: VideoProvider, embedId: string): string {
  return provider === "YOUTUBE"
    ? `https://www.youtube-nocookie.com/embed/${embedId}?rel=0&modestbranding=1&autoplay=1`
    : `https://www.instagram.com/p/${embedId}/embed`;
}

export function thumbnailUrl(
  provider: VideoProvider,
  embedId: string,
  custom?: string | null,
): string | null {
  if (custom) return custom;
  if (provider === "YOUTUBE") return `https://i.ytimg.com/vi/${embedId}/hqdefault.jpg`;
  return null;
}

export function watchUrl(provider: VideoProvider, embedId: string, externalUrl: string): string {
  if (externalUrl) return externalUrl;
  return provider === "YOUTUBE"
    ? `https://www.youtube.com/watch?v=${embedId}`
    : `https://www.instagram.com/p/${embedId}/`;
}

export function providerLabel(provider: VideoProvider): string {
  return provider === "YOUTUBE" ? "YouTube" : "Instagram";
}
