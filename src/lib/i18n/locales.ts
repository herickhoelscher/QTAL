/**
 * Idiomas do site. O portugues e o padrao e nao aparece no endereco; ingles e
 * espanhol ganham prefixo (/en/materias, /es/materias). Este arquivo nao
 * importa nada do Next, para servir igual ao proxy, ao servidor e ao cliente.
 */
export const LOCALES = ["pt", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt";

/** Idiomas que recebem traducao automatica do conteudo. */
export type TargetLocale = Exclude<Locale, "pt">;
export const TARGET_LOCALES: TargetLocale[] = ["en", "es"];

/** Tag BCP 47 usada no <html lang>, no hreflang e na formatacao de datas. */
export const LOCALE_TAG: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es-AR",
};

/** Formato do og:locale (sublinhado no lugar do hifen). */
export const OG_LOCALE: Record<Locale, string> = {
  pt: "pt_BR",
  en: "en_US",
  es: "es_AR",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Normaliza qualquer valor (inclusive undefined, fora do [lang]) para um idioma valido. */
export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

function isExternal(href: string): boolean {
  return /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href);
}

/**
 * Prefixa um caminho interno com o idioma: "/materias" vira "/en/materias".
 * Portugues fica sem prefixo; links externos, mailto:, tel:, ancoras, o painel
 * e a API passam intactos.
 */
export function localePath(href: string, locale: Locale): string {
  if (isExternal(href) || !href.startsWith("/")) return href;
  // Painel e API ficam fora do [lang]: sempre sem prefixo.
  if (/^\/(admin|api)(\/|\?|#|$)/.test(href)) return href;
  const clean = stripLocale(href);
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? "/" + locale : "/" + locale + clean;
}

/**
 * Tira o prefixo de idioma de um caminho: "/en/materias" e "/pt/materias"
 * viram "/materias". Aceita o /pt porque, no servidor, o proxy reescreve o
 * portugues para /pt internamente.
 */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(pt|en|es)(?=\/|\?|#|$)(.*)$/);
  if (!match) return pathname || "/";
  const rest = match[2];
  if (!rest) return "/";
  return rest.startsWith("/") ? rest : "/" + rest;
}

/** Idioma embutido no caminho do navegador; sem prefixo e portugues. */
export function localeFromPath(pathname: string): Locale {
  const match = pathname.match(/^\/(en|es)(?=\/|$)/);
  return match ? (match[1] as Locale) : DEFAULT_LOCALE;
}

/** Substitui {chave} no texto do dicionario. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}
