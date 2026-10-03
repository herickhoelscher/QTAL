/**
 * Busca, ordenacao e paginacao das listas do painel. Tudo vive no endereco
 * (?q=, ?ordem=campo:direcao, ?pagina=), para o link ser compartilhavel e o
 * botao Voltar funcionar.
 */

export type SortDir = "asc" | "desc";

export type ListParams = {
  q: string;
  page: number;
  take: number;
  sort: string;
  dir: SortDir;
};

export type RawListParams = { q?: string; pagina?: string; ordem?: string };

export const PAGE_SIZE = 20;

export function parseListParams(
  raw: RawListParams,
  {
    sortable,
    defaultSort,
    defaultDir = "desc",
    take = PAGE_SIZE,
  }: { sortable: string[]; defaultSort: string; defaultDir?: SortDir; take?: number },
): ListParams {
  const [field, direction] = (raw.ordem ?? "").split(":");
  const sort = sortable.includes(field) ? field : defaultSort;
  const dir: SortDir =
    sort === field && (direction === "asc" || direction === "desc") ? direction : defaultDir;

  const page = Number.parseInt(raw.pagina ?? "", 10);

  return {
    q: (raw.q ?? "").trim(),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    take,
    sort,
    dir,
  };
}

/** Quantos registros pular para chegar na pagina atual. */
export function skipOf(params: ListParams): number {
  return (params.page - 1) * params.take;
}

/** Endereco da lista com os parametros atuais trocados por `overrides`. */
export function listHref(
  base: string,
  params: ListParams,
  overrides: Partial<Pick<ListParams, "q" | "page" | "sort" | "dir">> = {},
): string {
  const next = { ...params, ...overrides };
  const query = new URLSearchParams();
  if (next.q) query.set("q", next.q);
  query.set("ordem", `${next.sort}:${next.dir}`);
  if (next.page > 1) query.set("pagina", String(next.page));
  return `${base}?${query.toString()}`;
}
