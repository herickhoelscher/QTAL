import Link from "next/link";

/**
 * Chamada do feed vertical de videos.
 *
 * O feed era a funcionalidade mais escondida do site — vivia atras de um link
 * discreto dentro de /videos. Aqui ele vira um bloco de largura inteira, com o
 * gesto explicado em uma linha, porque e a experiencia que as pessoas ja
 * conhecem de Reels e TikTok e a que mais prende quem chega.
 */
export function VideoFeedCallout({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/videos/feed"
      className={
        "group relative mb-10 flex items-center justify-between gap-6 overflow-hidden bg-ink p-6 text-white transition-colors hover:bg-brand md:p-8 " +
        className
      }
    >
      {/* Brilho que atravessa o bloco no hover: o unico movimento decorativo
          aqui, e ele so acontece por intencao do usuario. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-700 group-hover:left-full"
      />

      <span className="relative">
        <span className="eyebrow text-white/60">Feed de vídeos</span>
        <span className="mt-2 block font-display text-2xl leading-tight italic md:text-3xl">
          Role para cima e vá de um vídeo ao outro
        </span>
        <span className="mt-2 block max-w-md text-sm text-white/70">
          Tela cheia, som no toque e todos os vídeos do portal em sequência — igual ao
          que você já faz no celular.
        </span>
      </span>

      <span
        aria-hidden
        className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </Link>
  );
}
