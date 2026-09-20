"use client";

import { useState } from "react";

type Props = {
  title: string;
  path: string;
  tone?: "dark" | "light";
};

/** Compartilhamento nativo quando o navegador oferece, com fallback por rede. */
export function ShareButtons({ title, path, tone = "dark" }: Props) {
  const [copied, setCopied] = useState(false);

  // Endereco absoluto montado a partir da env publica, e nao de window.location:
  // servidor e cliente geram exatamente o mesmo href (sem hydration mismatch) e o
  // link compartilhado e sempre o canonico do site, nunca o de um preview.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const url = () => siteUrl + path;

  const share = async () => {
    const link = url();
    if (navigator.share) {
      try {
        await navigator.share({ title, url: link });
        return;
      } catch {
        // usuario cancelou o menu nativo; segue para a copia do link
      }
    }
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const base =
    "eyebrow rounded-full border px-4 py-2 transition-colors " +
    (tone === "light"
      ? "border-white/60 text-white hover:bg-white hover:text-brand"
      : "border-line text-ink hover:border-brand hover:text-brand");

  const networks = [
    {
      label: "WhatsApp",
      href: (link: string) =>
        "https://api.whatsapp.com/send?text=" + encodeURIComponent(title + " " + link),
    },
    {
      label: "Facebook",
      href: (link: string) =>
        "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(link),
    },
    {
      label: "LinkedIn",
      href: (link: string) =>
        "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(link),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={share} className={base}>
        {copied ? "Link copiado" : "Compartilhar"}
      </button>
      {networks.map((network) => (
        <a
          key={network.label}
          href={network.href(url())}
          target="_blank"
          rel="noopener noreferrer"
          className={base}
        >
          {network.label}
        </a>
      ))}
    </div>
  );
}
