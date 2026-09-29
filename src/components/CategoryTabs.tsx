"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

export type TabItem = {
  id: string;
  /** Slugs das editorias da materia; vazio aparece so na aba "Todas". */
  slugs: string[];
  node: ReactNode;
};

/**
 * Abas de editoria dentro de /materias. As materias ja vem todas renderizadas
 * do servidor, entao trocar de aba so escolhe quais aparecem — sem recarregar.
 * A escolha vai para ?categoria= para o link continuar compartilhavel e o botao
 * Voltar do navegador funcionar.
 */
export function CategoryTabs({
  categories,
  items,
  extra,
  emptyLabel = "Ainda não há matérias nesta editoria.",
}: {
  categories: { slug: string; name: string }[];
  items: TabItem[];
  /** Publieditorial, que continua no fim da lista. */
  extra?: ReactNode;
  emptyLabel?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("categoria") ?? "";

  const visible = active ? items.filter((item) => item.slugs.includes(active)) : items;

  function select(slug: string) {
    const next = new URLSearchParams(params.toString());
    if (slug) next.set("categoria", slug);
    else next.delete("categoria");
    const query = next.toString();
    router.replace(query ? "/materias?" + query : "/materias", { scroll: false });
  }

  const tab = (slug: string, name: string) => {
    const isActive = active === slug;
    return (
      <li key={slug || "todas"}>
        <button
          type="button"
          onClick={() => select(slug)}
          aria-current={isActive ? "true" : undefined}
          className={
            "eyebrow border-b-2 pb-1 transition-colors " +
            (isActive
              ? "border-brand text-brand"
              : "border-transparent text-muted hover:text-ink")
          }
        >
          {name}
        </button>
      </li>
    );
  };

  return (
    <>
      <nav aria-label="Editorias" className="mb-10 border-b border-line">
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-1">
          {tab("", "Todas")}
          {categories.map((category) => tab(category.slug, category.name))}
        </ul>
      </nav>

      {visible.length ? (
        <div className="masonry-2">
          {visible.map((item) => (
            <div key={item.id}>{item.node}</div>
          ))}
          {extra}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line px-6 py-16 text-center text-muted">
          {emptyLabel}
        </div>
      )}
    </>
  );
}
