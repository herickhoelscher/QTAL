const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const LONG_DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

const SHORT_DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "Sob consulta";
  return BRL.format(Number(value));
}

export function formatDateLong(date: Date | string): string {
  return LONG_DATE.format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return SHORT_DATE.format(new Date(date));
}

/** "3 dias atras" — usado no rodape dos cards do feed. */
export function timeAgo(date: Date | string): string {
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  const diff = Date.now() - new Date(date).getTime();
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
  ];
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return rtf.format(-Math.round(diff / ms), unit);
  }
  return "agora mesmo";
}

/**
 * Rotulo curto da edicao para o rodape do card: de "Edição 12 — Habitar o
 * clima" sobra "Edição 12", que e o que cabe ao lado do tempo relativo.
 */
export function editionLabel(title: string): string {
  return title.split(/\s[—–-]\s/)[0].trim();
}

export function excerpt(html: string, size = 160): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > size ? `${text.slice(0, size).trimEnd()}…` : text;
}
