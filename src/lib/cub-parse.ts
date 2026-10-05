/**
 * Leitura das paginas do CUB. Duas fontes:
 *
 * - Sinduscon Parana Oeste: tabela com o CUBOESTE/PR (regional de Toledo) e o
 *   CUB/PR, uma linha por indice, com a data de divulgacao.
 * - Sinduscon-PR: pagina do CUB-PR estadual, com o mes no titulo
 *   ("CUB-PR – Setembro 2026") e o valor em "Tabelas mais recentes".
 *
 * O regional as vezes atrasa; por isso o portal le as duas e fica com a mais
 * recente (no empate, a regional). Tudo aqui e puro: a busca fica em cub-source.
 */

export type CubIndex = "CUBOESTE/PR" | "CUB/PR";

export type CubReading = {
  value: number;
  /** Mes de referencia ja formatado, ex.: "agosto/2026". */
  reference: string;
  /** Ano * 12 + mes, para comparar qual leitura e mais nova. */
  period: number;
  changePercent: number | null;
  index: CubIndex;
  /** Regional: tabela do Sinduscon Oeste. Estadual: pagina do Sinduscon-PR. */
  origin: "regional" | "estadual";
  sourceUrl: string;
};

export const REGIONAL_SOURCE_URL = "https://sindusconparanaoeste.com.br/indicadores";
export const STATE_SOURCE_URL = "https://sindusconpr.com.br/economia/cub-pr/";

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function monthIndex(name: string): number {
  const clean = name.trim().toLowerCase().replace("marco", "março");
  return MONTHS.indexOf(clean);
}

/** "2.810,49" -> 2810.49 (padrao brasileiro, ponto de milhar). */
function parseNumber(raw: string): number | null {
  const clean = raw.replace(/\s|&nbsp;|R\$/g, "").replace(/\./g, "").replace(",", ".");
  const value = Number(clean);
  return Number.isFinite(value) ? value : null;
}

/** "3,44%" ou "0.32%" -> numero. Percentual nao tem milhar: ponto ou virgula e decimal. */
function parsePercent(raw: string): number | null {
  const clean = raw.replace(/\s|&nbsp;|%/g, "").replace(",", ".");
  if (!clean) return null;
  const value = Number(clean);
  return Number.isFinite(value) ? value : null;
}

/**
 * Le a linha de um indice na tabela do Sinduscon Oeste:
 * <td>CUBOESTE/PR</td><td>03/08/2026</td><td>2810,49</td><td>3,44%</td>...
 */
export function readRegionalRow(html: string, index: CubIndex): CubReading | null {
  const anchor = html.indexOf(index + "</td>");
  if (anchor < 0) return null;

  // O corte comeca depois do <td> do indice: a primeira celula e a data.
  const cells = [...html.slice(anchor, anchor + 1200).matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(
    (match) => match[1].replace(/<[^>]*>/g, "").trim(),
  );
  const [date, rawValue, change] = cells;
  const match = date?.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match || !rawValue) return null;

  const value = parseNumber(rawValue);
  if (value === null || value <= 0) return null;
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  if (month < 0 || month > 11) return null;

  return {
    value,
    reference: `${MONTHS[month]}/${year}`,
    period: year * 12 + month,
    changePercent: change ? parsePercent(change) : null,
    index,
    origin: "regional",
    sourceUrl: REGIONAL_SOURCE_URL,
  };
}

/** Le o CUB-PR mais recente da pagina do Sinduscon-PR. */
export function readStatePage(html: string): CubReading | null {
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

  const title = text.match(/CUB-PR\s*[–-]\s*([A-Za-zçÇ]+)\s+(\d{4})/);
  const latest = text.match(/mais recentes\s*CUB-PR\s*R\$\s*([\d.]+,\d{2})\s*(-?[\d.,]+)\s*%/i);
  if (!title || !latest) return null;

  const month = monthIndex(title[1]);
  const year = Number(title[2]);
  const value = parseNumber(latest[1]);
  if (month < 0 || value === null || value <= 0) return null;

  return {
    value,
    reference: `${MONTHS[month]}/${year}`,
    period: year * 12 + month,
    changePercent: parsePercent(latest[2]),
    index: "CUB/PR",
    origin: "estadual",
    sourceUrl: STATE_SOURCE_URL,
  };
}

/** A leitura mais recente; no empate, a regional (indice escolhido no painel). */
export function newestCub(
  regional: CubReading | null,
  state: CubReading | null,
): CubReading | null {
  if (!regional) return state;
  if (!state) return regional;
  return state.period > regional.period ? state : regional;
}
