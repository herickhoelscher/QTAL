"use client";

import { useState, type ReactNode } from "react";
import { useI18n } from "@/components/I18nProvider";

export type ExpandableItem = { id: string; node: ReactNode };

/**
 * Secao da home que abre com poucos itens e revela o resto no "Ver mais".
 * O conteudo ja veio inteiro do servidor: o botao so controla quantos filhos
 * sao renderizados — e nao a altura de um contêiner, que quebraria as colunas
 * da masonry.
 */
export function ExpandableSection({
  items,
  className,
  initial = 3,
  extra,
  label,
}: {
  items: ExpandableItem[];
  /** Classe da grade: a masonry das materias/eventos ou o grid dos videos/imoveis. */
  className: string;
  initial?: number;
  /** Publieditorial; entra junto com o restante da lista. */
  extra?: ReactNode;
  label?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const hasMore = items.length > initial;
  const visible = open || !hasMore ? items : items.slice(0, initial);

  return (
    <>
      <div className={className}>
        {visible.map((item) => (
          <div key={item.id}>{item.node}</div>
        ))}
        {open || !hasMore ? extra : null}
      </div>

      {hasMore && !open ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="eyebrow rounded-full border border-brand px-8 py-3 text-brand transition-colors hover:bg-brand hover:text-white"
          >
            {label ?? t.common.seeMore}
          </button>
        </div>
      ) : null}
    </>
  );
}
