"use client";

import { SITE_URL } from "@/lib/site-url";

import { useState } from "react";

type Props = {
  title: string;
  path: string;
  tone?: "dark" | "light";
  label?: string;
};

const ICONS = {
  share:
    "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0-3-3c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 6 15c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.92z",
  whatsapp:
    "M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.22-.17-.47-.29z",
  facebook:
    "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.12-2.4-.12-2.38 0-4 1.45-4 4.12V9.9H7.6V13h2.7v8h3.2z",
  x: "M18.9 2H22l-7.1 8.1L23.2 22h-6.6l-5.2-6.8L5.5 22H2.4l7.6-8.7L1.2 2h6.8l4.7 6.2L18.9 2zm-1.1 18h1.8L7.3 3.9H5.4L17.8 20z",
  linkedin:
    "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm6 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.75-1.95 4 0 4.4 2.5 4.4 5.8V21h-4v-5.6c0-1.35-.03-3.1-1.9-3.1-1.9 0-2.2 1.48-2.2 3v5.7H9V9z",
  link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7a5 5 0 0 0 0 10h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4a5 5 0 0 0 0-10z",
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

/**
 * Fileira de quadrados vazados, no padrao da referencia: compartilhamento
 * nativo quando o navegador oferece, as quatro redes e copiar link.
 */
export function ShareButtons({ title, path, tone = "dark", label = "Compartilhe em" }: Props) {
  const [copied, setCopied] = useState(false);

  // Endereco absoluto montado a partir da env publica, e nao de window.location:
  // servidor e cliente geram exatamente o mesmo href (sem hydration mismatch) e o
  // link compartilhado e sempre o canonico do site, nunca o de um preview.
  const url = SITE_URL + path;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // usuario cancelou o menu nativo; segue para a copia do link
      }
    }
    await copy();
  };

  const box =
    "flex h-11 w-11 items-center justify-center border transition-colors " +
    (tone === "light"
      ? "border-white/60 text-white hover:bg-white hover:text-brand"
      : "border-brand text-brand hover:bg-brand hover:text-white");

  const networks = [
    {
      key: "whatsapp" as const,
      label: "Compartilhar no WhatsApp",
      href: "https://api.whatsapp.com/send?text=" + encodeURIComponent(title + " " + url),
    },
    {
      key: "facebook" as const,
      label: "Compartilhar no Facebook",
      href: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url),
    },
    {
      key: "x" as const,
      label: "Compartilhar no X",
      href:
        "https://twitter.com/intent/tweet?url=" +
        encodeURIComponent(url) +
        "&text=" +
        encodeURIComponent(title),
    },
    {
      key: "linkedin" as const,
      label: "Compartilhar no LinkedIn",
      href: "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url),
    },
  ];

  return (
    <div>
      <p className={"eyebrow mb-3 " + (tone === "light" ? "text-white/80" : "text-ink")}>{label}</p>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={share} aria-label="Compartilhar" className={box}>
          <Icon name="share" />
        </button>

        {networks.map((network) => (
          <a
            key={network.key}
            href={network.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={network.label}
            className={box}
          >
            <Icon name={network.key} />
          </a>
        ))}

        <button type="button" onClick={copy} aria-label="Copiar link" className={box}>
          <Icon name="link" />
        </button>

        {copied ? (
          <span
            role="status"
            className={"text-xs " + (tone === "light" ? "text-white/80" : "text-muted")}
          >
            Link copiado
          </span>
        ) : null}
      </div>
    </div>
  );
}
