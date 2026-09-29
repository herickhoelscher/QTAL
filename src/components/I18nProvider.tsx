"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { DICTIONARIES, type Dictionary } from "@/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, localePath, type Locale } from "@/lib/i18n/locales";

type I18nValue = {
  locale: Locale;
  t: Dictionary;
  /** Prefixa um caminho interno com o idioma atual. */
  href: (path: string) => string;
};

const I18nContext = createContext<I18nValue>({
  locale: DEFAULT_LOCALE,
  t: DICTIONARIES[DEFAULT_LOCALE],
  href: (path) => path,
});

/**
 * Leva o idioma da rota aos componentes de cliente. So o codigo do idioma
 * atravessa a fronteira servidor/cliente; o dicionario ja esta no bundle.
 */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      t: DICTIONARIES[locale],
      href: (path: string) => localePath(path, locale),
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
