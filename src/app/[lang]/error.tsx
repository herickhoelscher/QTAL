"use client";

import { useEffect } from "react";
import Link from "@/components/LocalizedLink";
import { useI18n } from "@/components/I18nProvider";

/**
 * Última barreira do site: um erro inesperado vira uma página com saída, e não
 * uma tela em branco. O detalhe técnico vai para o console, nunca para o leitor.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-alt px-6 py-20">
      <div className="max-w-lg text-center">
        <p className="eyebrow text-brand">{t.error.eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">{t.error.title}</h1>
        <p className="mt-4 text-muted">{t.error.text}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="eyebrow bg-brand px-6 py-3 text-white transition-colors hover:bg-brand-dark"
          >
            {t.error.retry}
          </button>
          <Link
            href="/"
            className="eyebrow border border-line px-6 py-3 transition-colors hover:border-brand hover:text-brand"
          >
            {t.error.backHome}
          </Link>
        </div>
      </div>
    </main>
  );
}
