import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { LOCALES, LOCALE_TAG, localePath } from "@/lib/i18n/locales";

/**
 * canonical + hreflang de uma pagina: cada idioma aponta para a propria versao
 * e lista as outras duas, para o Google servir a versao certa a cada leitor.
 */
export async function alternatesFor(path: string): Promise<Metadata["alternates"]> {
  const locale = await getLocale();
  return {
    canonical: localePath(path, locale),
    languages: {
      ...Object.fromEntries(LOCALES.map((item) => [LOCALE_TAG[item], localePath(path, item)])),
      "x-default": path,
    },
  };
}
