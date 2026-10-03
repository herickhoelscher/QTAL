import Link from "next/link";
import type { ReactNode } from "react";
import type { ContentStatus } from "@prisma/client";
import { CONTROL, PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/components/admin/styles";
import { listHref, type ListParams } from "@/lib/admin-list";

export function AdminHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className={PRIMARY_BUTTON}>
          <span aria-hidden className="text-lg leading-none">+</span>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

/** Pilula cinza de status, igual para todos os estados (padrao da referencia). */
export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-surface-alt px-3 py-1 text-xs font-semibold tracking-wide text-muted uppercase ring-1 ring-line">
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: ContentStatus }) {
  return <Pill>{status === "PUBLISHED" ? "Publicado" : "Rascunho"}</Pill>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={
        "rounded-2xl border border-line bg-surface shadow-[0_1px_3px_rgba(15,23,42,0.06)] " +
        className
      }
    >
      {children}
    </div>
  );
}

export function AdminTable({
  headers,
  children,
}: {
  headers: ReactNode[];
  children: ReactNode;
}) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-alt">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-4 text-xs font-bold tracking-wide whitespace-nowrap text-muted uppercase"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </Card>
  );
}

/** Linha padrao das tabelas do painel. */
export function Row({ children }: { children: ReactNode }) {
  return <tr className="border-b border-line last:border-0">{children}</tr>;
}

export function Cell({
  children,
  strong,
  className = "",
}: {
  children: ReactNode;
  strong?: boolean;
  className?: string;
}) {
  return (
    <td
      className={
        "px-6 py-4 " + (strong ? "font-semibold text-ink " : "text-muted tabular-nums ") + className
      }
    >
      {children}
    </td>
  );
}

/** Cabecalho de coluna que ordena: clica e alterna crescente/decrescente. */
export function SortHeader({
  label,
  field,
  base,
  params,
}: {
  label: string;
  field: string;
  base: string;
  params: ListParams;
}) {
  const active = params.sort === field;
  const nextDir = active && params.dir === "desc" ? "asc" : "desc";
  return (
    <Link
      href={listHref(base, params, { sort: field, dir: nextDir, page: 1 })}
      className="inline-flex items-center gap-1.5 hover:text-ink"
      aria-label={`Ordenar por ${label.toLowerCase()}`}
    >
      {label}
      <svg viewBox="0 0 10 14" width="8" height="12" aria-hidden className="fill-current">
        <path d="M5 0 9.5 5.5h-9z" opacity={active && params.dir === "desc" ? 0.35 : 1} />
        <path d="M5 14 .5 8.5h9z" opacity={active && params.dir === "asc" ? 0.35 : 1} />
      </svg>
    </Link>
  );
}

/** Busca por nome. GET simples: o termo vai para ?q= e a lista volta a pagina 1. */
export function SearchBar({ params }: { params: ListParams }) {
  return (
    <form method="get" className="mb-6 flex gap-3" role="search">
      {params.sort ? <input type="hidden" name="ordem" value={`${params.sort}:${params.dir}`} /> : null}
      <label htmlFor="busca" className="sr-only">
        Buscar por nome
      </label>
      <input
        id="busca"
        name="q"
        type="search"
        defaultValue={params.q}
        placeholder="Buscar por nome"
        className={CONTROL}
      />
      <button type="submit" className={PRIMARY_BUTTON + " px-5"}>
        Buscar
      </button>
    </form>
  );
}

export function Pagination({
  base,
  params,
  total,
}: {
  base: string;
  params: ListParams;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / params.take));
  return (
    <nav aria-label="Paginação" className="mt-6 flex flex-wrap justify-center gap-2">
      {Array.from({ length: pages }, (_, index) => index + 1).map((page) => {
        const current = page === params.page;
        return (
          <Link
            key={page}
            href={listHref(base, params, { page })}
            aria-current={current ? "page" : undefined}
            className={
              "flex h-10 min-w-10 items-center justify-center rounded px-3 text-sm font-semibold transition-colors " +
              (current
                ? "bg-[#26246e] text-white"
                : "border border-line bg-surface text-ink hover:border-ink")
            }
          >
            {page}
          </Link>
        );
      })}
    </nav>
  );
}

/** Ver / Editar / Excluir no fim de cada linha. */
export function RowActions({
  viewHref,
  editHref,
  children,
}: {
  viewHref: string;
  editHref: string;
  /** O botao de excluir (cliente), quando a linha puder ser excluida. */
  children?: ReactNode;
}) {
  return (
    <td className="px-6 py-4">
      <div className="flex items-center justify-end gap-4 text-sm font-semibold whitespace-nowrap">
        <Link href={viewHref} className="text-link hover:underline">
          Ver
        </Link>
        <Link href={editHref} className="text-ink hover:underline">
          Editar
        </Link>
        {children}
      </div>
    </td>
  );
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center text-sm text-muted">
      {children}
    </div>
  );
}

export function SavedNotice({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p
      role="status"
      className="mb-6 rounded-xl border border-emerald-600/30 bg-emerald-600/10 px-4 py-3 text-sm text-ink"
    >
      Alterações salvas.
    </p>
  );
}

/** Cabecalho da pagina Ver: seta de voltar, titulo, "Detalhes de ..." e o link para o site. */
export function DetailHeading({
  title,
  subtitle,
  backHref,
  open,
}: {
  title: string;
  subtitle: string;
  backHref: string;
  open?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <Link
          href={backHref}
          aria-label="Voltar"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
        </div>
      </div>
      {open ? (
        <a href={open.href} target="_blank" rel="noreferrer" className={SECONDARY_BUTTON + " py-2"}>
          {open.label}
        </a>
      ) : null}
    </div>
  );
}

/** Ficha da pagina Ver: rotulos pequenos em maiusculas, duas colunas. */
export function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <Card className="p-5 md:p-6">
      <dl className="grid gap-x-8 gap-y-5 md:grid-cols-2">{children}</dl>
    </Card>
  );
}

export function DetailItem({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={"min-w-0" + (wide ? " md:col-span-2" : "")}>
      <dt className="text-xs font-bold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-1 text-sm break-words text-ink">{children || "—"}</dd>
    </div>
  );
}

/** Editar e Excluir no pe da pagina Ver. */
export function DetailActions({ editHref, children }: { editHref: string; children?: ReactNode }) {
  return (
    <div className="mt-5 flex justify-end gap-3">
      <Link href={editHref} className={PRIMARY_BUTTON + " py-2"}>
        Editar
      </Link>
      {children}
    </div>
  );
}

/** Miniatura da capa na pagina Ver. */
export function CoverPreview({ url, alt }: { url: string | null; alt?: string | null }) {
  if (!url) return <>—</>;
  return (
    <span className="block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt ?? ""} className="mt-1 max-h-48 rounded-xl border border-line object-cover" />
      {alt ? <span className="mt-1 block text-xs text-muted">{alt}</span> : null}
    </span>
  );
}

/** Corpo em HTML (ja sanitizado ao salvar) com a formatacao do site. */
export function BodyPreview({ html }: { html: string | null }) {
  if (!html?.trim()) return <>—</>;
  // Tamanho inline: .prose-editorial fica fora das camadas do Tailwind e venceria o text-sm.
  return (
    <div
      className="prose-editorial"
      style={{ fontSize: "0.875rem", lineHeight: 1.7 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
