import Link from "next/link";
import type { ContentStatus } from "@prisma/client";
import { reorderFeatured, toggleFeatured } from "@/app/admin/actions/featured";
import { AdminEmpty, AdminTable, Cell, Row, StatusPill } from "@/components/admin/ui";
import { FEATURED_LIMIT } from "@/lib/featured";
import type { FeaturedModel } from "@/lib/featured-db";

/** Abas "Todos" e "Destaques (n/6)" no topo de cada lista. */
export function FeaturedTabs({
  base,
  active,
  count,
}: {
  base: string;
  active: "todos" | "destaques";
  count: number;
}) {
  const tab = (href: string, label: string, current: boolean) => (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={
        "rounded-lg px-4 py-2 text-sm font-semibold transition-colors " +
        (current ? "bg-brand text-on-brand" : "text-muted hover:bg-surface-alt hover:text-ink")
      }
    >
      {label}
    </Link>
  );
  return (
    <nav aria-label="Filtro da lista" className="mb-5 flex gap-2">
      {tab(base, "Todos", active === "todos")}
      {tab(base + "?aba=destaques", `Destaques (${count}/${FEATURED_LIMIT})`, active === "destaques")}
    </nav>
  );
}

/** Aviso de fila cheia, vindo do ?aviso= que a acao devolve. */
export function FeaturedNotice({ aviso }: { aviso?: string }) {
  if (aviso !== "destaques-cheios") return null;
  return (
    <p role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
      Já há {FEATURED_LIMIT} destaques nesta seção. Tire um na aba Destaques antes de marcar outro.
    </p>
  );
}

/** Estrela de cada linha da aba Todos: cheia (com a posicao) quando destacado. */
export function FeaturedStar({
  model,
  id,
  rank,
  back,
}: {
  model: FeaturedModel;
  id: string;
  rank: number | null;
  back: string;
}) {
  const on = rank !== null;
  return (
    <form action={toggleFeatured}>
      <input type="hidden" name="model" value={model} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="wanted" value={on ? "0" : "1"} />
      <input type="hidden" name="back" value={back} />
      <button
        type="submit"
        title={on ? `Destaque ${rank} — clique para tirar` : "Destacar"}
        aria-label={on ? `Tirar dos destaques (posição ${rank})` : "Destacar"}
        aria-pressed={on}
        className={
          "inline-flex items-center gap-1 text-base leading-none transition-colors " +
          (on ? "text-[#e0a100]" : "text-muted/50 hover:text-[#e0a100]")
        }
      >
        {on ? "★" : "☆"}
        {on ? <span className="text-xs font-bold">{rank}</span> : null}
      </button>
    </form>
  );
}

type QueueItem = { id: string; title: string; rank: number | null; status: ContentStatus };

function QueueButton({
  model,
  id,
  back,
  dir,
  disabled,
}: {
  model: FeaturedModel;
  id: string;
  back: string;
  dir: "up" | "down";
  disabled: boolean;
}) {
  return (
    <form action={reorderFeatured}>
      <input type="hidden" name="model" value={model} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dir" value={dir} />
      <input type="hidden" name="back" value={back} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={dir === "up" ? "Subir" : "Descer"}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:border-ink disabled:opacity-30"
      >
        {dir === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}

/** Aba Destaques: a fila em ordem, com setas e Remover. */
export function FeaturedQueue({
  model,
  items,
  base,
}: {
  model: FeaturedModel;
  items: QueueItem[];
  base: string;
}) {
  const back = base + "?aba=destaques";
  if (!items.length) {
    return (
      <AdminEmpty>
        Nenhum destaque ainda. Na aba Todos, clique na ☆ de até {FEATURED_LIMIT} itens. Eles abrem
        o bloco desta seção na home e a página dela no site, nesta ordem.
      </AdminEmpty>
    );
  }
  return (
    <AdminTable headers={["Ordem", "Registro", "Status", ""]}>
      {items.map((item, index) => (
        <Row key={item.id}>
          <Cell strong>{index + 1}</Cell>
          <Cell strong>
            <Link href={`${base}/${item.id}`} className="hover:underline">
              {item.title}
            </Link>
          </Cell>
          <Cell>
            <StatusPill status={item.status} />
          </Cell>
          <td className="px-6 py-4">
            <div className="flex items-center justify-end gap-2">
              <QueueButton model={model} id={item.id} back={back} dir="up" disabled={index === 0} />
              <QueueButton
                model={model}
                id={item.id}
                back={back}
                dir="down"
                disabled={index === items.length - 1}
              />
              <form action={toggleFeatured} className="ml-2">
                <input type="hidden" name="model" value={model} />
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="wanted" value="0" />
                <input type="hidden" name="back" value={back} />
                <button type="submit" className="text-sm font-semibold text-danger hover:underline">
                  Remover
                </button>
              </form>
            </div>
          </td>
        </Row>
      ))}
    </AdminTable>
  );
}
