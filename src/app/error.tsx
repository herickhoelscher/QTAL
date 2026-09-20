"use client";

import Link from "next/link";
import { useEffect } from "react";

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
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-alt px-6 py-20">
      <div className="max-w-lg text-center">
        <p className="eyebrow text-brand">Algo saiu do ar</p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
          Não foi possível carregar esta página
        </h1>
        <p className="mt-4 text-muted">
          A falha foi registrada. Tente de novo em instantes — o resto do site continua
          funcionando normalmente.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="eyebrow bg-brand px-6 py-3 text-white transition-colors hover:bg-brand-dark"
          >
            Tentar de novo
          </button>
          <Link
            href="/"
            className="eyebrow border border-line px-6 py-3 transition-colors hover:border-brand hover:text-brand"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  );
}
