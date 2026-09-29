import { DEFAULT_LOCALE, LOCALE_TAG, type Locale } from "@/lib/i18n/locales";

// O valor continua em reais em qualquer idioma — so a pontuacao acompanha o leitor.
const BRL: Record<Locale, Intl.NumberFormat> = {
  pt: currency("pt"),
  en: currency("en"),
  es: currency("es"),
};

function currency(locale: Locale) {
  return new Intl.NumberFormat(LOCALE_TAG[locale], {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });
}

function dateFormat(locale: Locale, long: boolean) {
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "2-digit",
    month: long ? "long" : "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

const LONG_DATE: Record<Locale, Intl.DateTimeFormat> = {
  pt: dateFormat("pt", true),
  en: dateFormat("en", true),
  es: dateFormat("es", true),
};

const SHORT_DATE: Record<Locale, Intl.DateTimeFormat> = {
  pt: dateFormat("pt", false),
  en: dateFormat("en", false),
  es: dateFormat("es", false),
};

const PRICE_ON_REQUEST: Record<Locale, string> = {
  pt: "Sob consulta",
  en: "Price on request",
  es: "Consultar precio",
};

const JUST_NOW: Record<Locale, string> = {
  pt: "agora mesmo",
  en: "just now",
  es: "recién",
};

export function formatCurrency(
  value: number | string | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (value === null || value === undefined || value === "") return PRICE_ON_REQUEST[locale];
  return BRL[locale].format(Number(value));
}

export function formatDateLong(date: Date | string, locale: Locale = DEFAULT_LOCALE): string {
  return LONG_DATE[locale].format(new Date(date));
}

export function formatDateShort(date: Date | string, locale: Locale = DEFAULT_LOCALE): string {
  return SHORT_DATE[locale].format(new Date(date));
}

/** "3 dias atras" — usado no rodape dos cards do feed. */
export function timeAgo(date: Date | string, locale: Locale = DEFAULT_LOCALE): string {
  const rtf = new Intl.RelativeTimeFormat(LOCALE_TAG[locale], { numeric: "auto" });
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
  return JUST_NOW[locale];
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
