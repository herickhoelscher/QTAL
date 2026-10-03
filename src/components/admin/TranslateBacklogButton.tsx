"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { translateBacklogNow } from "@/app/admin/actions/settings";
import { SECONDARY_BUTTON } from "@/components/admin/styles";

function Button() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={SECONDARY_BUTTON + " disabled:opacity-60"}
    >
      {pending ? "Traduzindo…" : "Traduzir acervo"}
    </button>
  );
}

/**
 * Traduz o que foi publicado antes de a chave do DeepL existir. Formulario
 * proprio, fora do de configuracoes: HTML nao aceita formulario aninhado.
 */
export function TranslateBacklogButton() {
  const [state, action] = useActionState(translateBacklogNow, {});

  return (
    <form
      action={action}
      className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] md:p-6"
    >
      <p className="text-base font-bold text-ink">Traduzir o conteúdo já publicado</p>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        O que for publicado daqui em diante é traduzido na hora. Este botão traduz o que já estava
        no ar, em lotes de 20 itens por clique — clique de novo até aparecer que o acervo está
        completo.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Button />
        {state.error ? (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p role="status" className="text-sm text-ink">
            {state.success}
          </p>
        ) : null}
      </div>
    </form>
  );
}
