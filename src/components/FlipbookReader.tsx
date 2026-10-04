"use client";

import Link from "@/components/LocalizedLink";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { PageFlip } from "page-flip";
import { useI18n } from "@/components/I18nProvider";
import { CoverOverlay } from "@/components/IssueCover";
import { fmt } from "@/lib/i18n/locales";
import type { FlipPage } from "@/lib/issue-cover";

export type { FlipPage };

const ZOOM_LEVELS = [1, 1.5, 2, 3];

/**
 * Leitor folheavel das edicoes (padrao da DIFE): revista aberta em duas
 * paginas no computador e uma no celular, virando com clique, arrasto, setas
 * ou teclado. A barra de baixo traz contador, miniaturas, zoom, tela cheia,
 * compartilhar e mais opcoes.
 *
 * As paginas do livro sao criadas fora do React: a biblioteca move os
 * elementos para dentro da propria estrutura, e o React nao pode ser dono deles.
 */
export function FlipbookReader({
  pages,
  title,
  shareUrl,
  magazineHref,
}: {
  pages: FlipPage[];
  title: string;
  shareUrl: string;
  /** Modo Revista da mesma edicao, quando ela tambem tem materias. */
  magazineHref?: string;
}) {
  const { t } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const book = useRef<PageFlip | null>(null);

  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [landscape, setLandscape] = useState(true);
  const [panel, setPanel] = useState<"thumbs" | "more" | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Onde o React escreve o texto das capas montadas, dentro das paginas da biblioteca.
  const [coverHosts, setCoverHosts] = useState<{ index: number; host: HTMLElement }[]>([]);

  const total = pages.length;

  useEffect(() => {
    const host = stage.current;
    if (!host || !total) return;
    let cancelled = false;

    // A biblioteca mexe no DOM ao carregar: so no navegador.
    void import("page-flip").then(({ PageFlip }) => {
      if (cancelled) return;
      const mount = document.createElement("div");
      host.appendChild(mount);

      const hosts: { index: number; host: HTMLElement }[] = [];
      const elements = pages.map((page, index) => {
        const element = document.createElement("div");
        element.className = "flip-page";
        // A capa e a contracapa ficam "duras", como numa revista de verdade.
        if (index === 0 || index === total - 1) element.dataset.density = "hard";
        if (page.url) {
          const image = document.createElement("img");
          image.src = page.url;
          image.alt = page.cover ? "" : (page.alt ?? "");
          image.draggable = false;
          image.loading = index < 4 ? "eager" : "lazy";
          element.appendChild(image);
        }
        if (page.cover) {
          element.classList.add("flip-page--cover");
          const host = document.createElement("div");
          element.appendChild(host);
          hosts.push({ index, host });
        }
        return element;
      });
      setCoverHosts(hosts);
      elements.forEach((element) => mount.appendChild(element));

      const flip = new PageFlip(mount, {
        width: 600,
        height: 800,
        size: "stretch",
        minWidth: 240,
        maxWidth: 900,
        minHeight: 320,
        maxHeight: 1200,
        showCover: true,
        usePortrait: true,
        drawShadow: true,
        maxShadowOpacity: 0.4,
        flippingTime: 700,
        mobileScrollSupport: true,
        showPageCorners: true,
      });
      flip.on("flip", (event) => setCurrent(Number(event.data)));
      flip.on("changeOrientation", (event) => setLandscape(event.data === "landscape"));
      flip.on("init", () => {
        setLandscape(flip.getOrientation() === "landscape");
        setReady(true);
      });
      flip.loadFromHTML(elements);
      book.current = flip;
    });

    return () => {
      cancelled = true;
      book.current?.destroy();
      book.current = null;
      host.innerHTML = "";
    };
  }, [pages, total]);

  const next = useCallback(() => book.current?.flipNext(), []);
  const prev = useCallback(() => book.current?.flipPrev(), []);
  const goTo = useCallback((page: number) => {
    book.current?.turnToPage(page);
    setCurrent(page);
    setPanel(null);
  }, []);

  // Setas do teclado, menos quando a pessoa esta digitando.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("input, textarea, [contenteditable]")) return;
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "Escape") {
        setPanel(null);
        setZoom(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Entrar ou sair da tela cheia muda o tamanho da area so depois que o React
  // aplica o layout novo; o resize da janela chega antes. Recalcula em seguida.
  useEffect(() => {
    const frame = requestAnimationFrame(() => book.current?.update());
    return () => cancelAnimationFrame(frame);
  }, [fullscreen]);

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void root.current?.requestFullscreen?.();
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // Cancelado pela pessoa: cai para copiar o link.
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Sem permissao de area de transferencia: nada a fazer.
    }
  }

  // No computador a revista mostra duas paginas: o zoom amplia as duas.
  const spread =
    landscape && current > 0 && current < total - 1
      ? [current % 2 === 1 ? current : current - 1, current % 2 === 1 ? current + 1 : current]
      : [current];
  const counter =
    spread.length > 1 && spread[1] < total
      ? `${spread[0] + 1}-${spread[1] + 1}`
      : String(current + 1);

  const zoomIndex = ZOOM_LEVELS.indexOf(zoom);

  // Revista aberta: a capa sozinha fica na metade direita e a contracapa na
  // esquerda. Desloca um quarto para que fiquem no centro, como no celular.
  const aloneShift =
    landscape && spread.length === 1 && total > 1
      ? current === 0
        ? "-25%"
        : current === total - 1 && total % 2 === 0
          ? "25%"
          : null
      : null;

  return (
    <div
      ref={root}
      className={
        "flipbook relative " +
        (fullscreen ? "flex h-full flex-col justify-center bg-brand p-4" : "")
      }
    >
      {/* w-full: em tela cheia o pai vira coluna flex e, sem isso, a linha encolhe
          ate o minimo da revista e as paginas saem do lugar. */}
      <div className="relative mx-auto flex w-full items-center gap-2 md:gap-6">
        <ArrowButton
          label={t.reader.prev}
          direction="prev"
          onClick={prev}
          disabled={current === 0}
        />

        <div
          className="relative min-w-0 flex-1"
          style={{
            // Cabe na tela: a altura da revista acompanha a da janela.
            maxWidth: fullscreen
              ? "calc((100vh - 120px) * 1.5)"
              : "min(1100px, calc((100vh - 260px) * 1.5))",
            marginInline: "auto",
          }}
        >
          {!ready && pages[0] ? (
            // Enquanto a biblioteca carrega, a capa segura o lugar.
            <PageArt
              page={pages[0]}
              className="mx-auto aspect-[3/4] w-1/2 min-w-[240px] object-cover shadow-2xl"
            />
          ) : null}
          <div
            ref={stage}
            className={ready ? "transition-transform duration-300" : "absolute inset-0 opacity-0"}
            style={{ transform: aloneShift ? `translateX(${aloneShift})` : undefined }}
          />
        </div>

        <ArrowButton
          label={t.reader.next}
          direction="next"
          onClick={next}
          disabled={current >= total - 1}
        />
      </div>

      {/* Barra de ferramentas */}
      <div className="relative mx-auto mt-4 flex w-fit items-center rounded-lg bg-white px-1 py-1 text-ink shadow-lg">
        <span className="px-3 text-xs font-semibold tabular-nums text-muted" aria-live="polite">
          {counter}/{total}
        </span>
        <ToolButton
          label={t.reader.thumbnails}
          pressed={panel === "thumbs"}
          onClick={() => setPanel(panel === "thumbs" ? null : "thumbs")}
        >
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
        </ToolButton>
        <ToolButton
          label={t.reader.zoomIn}
          disabled={zoomIndex === ZOOM_LEVELS.length - 1}
          onClick={() => setZoom(ZOOM_LEVELS[Math.min(zoomIndex + 1, ZOOM_LEVELS.length - 1)])}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M11 8v6M8 11h6M16.5 16.5L21 21" />
        </ToolButton>
        <ToolButton
          label={t.reader.zoomOut}
          disabled={zoom === 1}
          onClick={() => setZoom(ZOOM_LEVELS[Math.max(zoomIndex - 1, 0)])}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M8 11h6M16.5 16.5L21 21" />
        </ToolButton>
        <ToolButton
          label={fullscreen ? t.reader.exitFullscreen : t.reader.fullscreen}
          pressed={fullscreen}
          onClick={toggleFullscreen}
        >
          <path
            d={
              fullscreen
                ? "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"
                : "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
            }
          />
        </ToolButton>
        <ToolButton label={t.reader.share} onClick={() => void share()}>
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
        </ToolButton>
        <ToolButton
          label={t.reader.more}
          pressed={panel === "more"}
          onClick={() => setPanel(panel === "more" ? null : "more")}
        >
          <circle cx="5" cy="12" r="1.2" />
          <circle cx="12" cy="12" r="1.2" />
          <circle cx="19" cy="12" r="1.2" />
        </ToolButton>

        {copied ? (
          <span
            role="status"
            className="absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-ink px-3 py-1 text-xs text-white"
          >
            {t.reader.linkCopied}
          </span>
        ) : null}

        {panel === "more" ? (
          <div className="absolute right-0 bottom-full z-20 mb-2 w-64 overflow-hidden rounded-lg bg-white py-1 text-sm shadow-xl">
            <button
              type="button"
              onClick={() => goTo(0)}
              className="block w-full px-4 py-2.5 text-left hover:bg-surface-alt"
            >
              {t.reader.first}
            </button>
            <button
              type="button"
              onClick={() => goTo(total - 1)}
              className="block w-full px-4 py-2.5 text-left hover:bg-surface-alt"
            >
              {t.reader.last}
            </button>
            {magazineHref ? (
              <Link href={magazineHref} className="block px-4 py-2.5 hover:bg-surface-alt">
                {t.reader.magazineMode}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-center text-xs text-white/70">{t.reader.hint}</p>

      {/* Miniaturas: todas as paginas, para pular direto */}
      {panel === "thumbs" ? (
        <Overlay
          title={t.reader.thumbnails}
          closeLabel={t.reader.close}
          onClose={() => setPanel(null)}
        >
          <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {pages.map((page, index) => (
              <li key={page.url + index}>
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={fmt(t.reader.goToPage, { n: index + 1 })}
                  aria-current={spread.includes(index)}
                  className={
                    "block w-full overflow-hidden rounded-md ring-2 transition " +
                    (spread.includes(index) ? "ring-white" : "ring-transparent hover:ring-white/60")
                  }
                >
                  <PageArt
                    page={page}
                    decorative
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover"
                  />
                </button>
                <span className="mt-1 block text-center text-xs text-white/80">{index + 1}</span>
              </li>
            ))}
          </ul>
        </Overlay>
      ) : null}

      {/* Zoom: as paginas abertas, ampliadas, com rolagem para percorrer */}
      {zoom > 1 ? (
        <Overlay
          title={`${Math.round(zoom * 100)}%`}
          closeLabel={t.reader.close}
          onClose={() => setZoom(1)}
          actions={
            <>
              <button
                type="button"
                onClick={() => setZoom(ZOOM_LEVELS[Math.max(zoomIndex - 1, 0)])}
                className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
              >
                −
              </button>
              <button
                type="button"
                disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                onClick={() =>
                  setZoom(ZOOM_LEVELS[Math.min(zoomIndex + 1, ZOOM_LEVELS.length - 1)])
                }
                className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20 disabled:opacity-40"
              >
                +
              </button>
            </>
          }
        >
          <div className="flex justify-center" style={{ width: `${zoom * 100}%` }}>
            {spread
              .filter((index) => index < total)
              .map((index) => (
                <PageArt
                  key={index}
                  page={pages[index]}
                  className="max-w-none object-contain"
                  style={{ width: spread.length > 1 ? "50%" : "70%" }}
                />
              ))}
          </div>
        </Overlay>
      ) : null}

      {coverHosts.map(({ index, host }) => {
        const cover = pages[index]?.cover;
        return cover ? createPortal(<CoverOverlay text={cover} />, host, "capa-" + index) : null;
      })}
    </div>
  );
}

/** Imagem de uma pagina fora do livro (miniatura, zoom); na capa montada, com o texto. */
function PageArt({
  page,
  className = "",
  style,
  loading,
  decorative,
}: {
  page: FlipPage;
  className?: string;
  style?: CSSProperties;
  loading?: "lazy" | "eager";
  /** Miniatura dentro de um botao que ja tem rotulo: a imagem nao precisa de texto. */
  decorative?: boolean;
}) {
  if (!page.cover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={page.url}
        alt={decorative ? "" : (page.alt ?? "")}
        loading={loading}
        className={className}
        style={style}
      />
    );
  }
  return (
    <span
      className={"relative block aspect-[3/4] overflow-hidden bg-[#1b1d22] " + className}
      style={style}
    >
      {page.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.url}
          alt=""
          loading={loading}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <CoverOverlay text={page.cover} />
    </span>
  );
}

function ArrowButton({
  label,
  direction,
  onClick,
  disabled,
}: {
  label: string;
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="z-10 flex h-12 w-8 shrink-0 items-center justify-center text-white transition-opacity hover:opacity-80 disabled:opacity-25 md:w-12"
    >
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        aria-hidden
      >
        <path d={direction === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}

function ToolButton({
  label,
  onClick,
  pressed,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      className={
        "flex h-9 w-9 items-center justify-center rounded-md transition-colors disabled:opacity-30 " +
        (pressed ? "bg-surface-alt text-ink" : "text-muted hover:bg-surface-alt hover:text-ink")
      }
    >
      <svg
        viewBox="0 0 24 24"
        width="17"
        height="17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        {children}
      </svg>
    </button>
  );
}

function Overlay({
  title,
  closeLabel,
  onClose,
  actions,
  children,
}: {
  title: string;
  closeLabel: string;
  onClose: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[70] flex flex-col bg-black/90 text-white"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <p className="text-sm font-semibold">{title}</p>
        <div className="flex items-center gap-2">
          {actions}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
          >
            {closeLabel} ✕
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4 pb-8 md:px-8">{children}</div>
    </div>
  );
}
