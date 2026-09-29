import { lang } from "next/root-params";
import { toLocale, type Locale } from "./locales";
import { DICTIONARIES, type Dictionary } from "./dictionaries";

/**
 * Idioma da requisicao atual, lido do segmento [lang] da rota. Fora dele (no
 * painel, que tem layout raiz proprio) o valor nao existe e vale o portugues.
 */
export async function getLocale(): Promise<Locale> {
  return toLocale(await lang());
}

export async function getDictionary(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: DICTIONARIES[locale] };
}
