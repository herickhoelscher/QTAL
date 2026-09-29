"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import { LOCALES, fmt, localePath, stripLocale, type Locale } from "@/lib/i18n/locales";

/** Bandeiras simplificadas em SVG: nitidas em qualquer tela e sem requisicao extra. */
function Flag({ locale }: { locale: Locale }) {
  if (locale === "pt") {
    return (
      <svg viewBox="0 0 30 21" aria-hidden className="block h-full w-full">
        <rect width="30" height="21" fill="#009c3b" />
        <path d="M15 2.5 27 10.5 15 18.5 3 10.5z" fill="#ffdf00" />
        <circle cx="15" cy="10.5" r="4.4" fill="#002776" />
        <path d="M10.8 9.6c2.8-.5 5.8.1 8.3 1.6" stroke="#fff" strokeWidth="0.8" fill="none" />
      </svg>
    );
  }
  if (locale === "en") {
    return (
      <svg viewBox="0 0 30 21" aria-hidden className="block h-full w-full">
        <rect width="30" height="21" fill="#fff" />
        {[0, 2, 4, 6, 8, 10, 12].map((i) => (
          <rect key={i} y={i * (21 / 13)} width="30" height={21 / 13} fill="#b22234" />
        ))}
        <rect width="13" height={(21 / 13) * 7} fill="#3c3b6e" />
        {[1.8, 4.2, 6.6, 9, 11.2].map((x) =>
          [1.8, 4.3, 6.8, 9.3].map((y) => (
            <circle key={x + "-" + y} cx={x} cy={y} r="0.55" fill="#fff" />
          )),
        )}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 30 21" aria-hidden className="block h-full w-full">
      <rect width="30" height="21" fill="#74acdf" />
      <rect y="7" width="30" height="7" fill="#fff" />
      <circle cx="15" cy="10.5" r="2" fill="#f6b40e" stroke="#85340a" strokeWidth="0.35" />
    </svg>
  );
}

/**
 * Tres bandeiras: clicar troca o idioma mantendo a pagina — quem esta em
 * /materias/reforma vai para /en/materias/reforma. Link comum (<a>) de
 * proposito: a troca recarrega a pagina e o <html lang> ja chega certo.
 */
export function LocaleSwitcher({
  variant = "compact",
  className = "",
}: {
  /** compact: so bandeiras (barra do topo). labeled: bandeira + nome (menu no celular). */
  variant?: "compact" | "labeled";
  className?: string;
}) {
  const { locale: current, t } = useI18n();
  const pathname = usePathname() ?? "/";
  const rest = stripLocale(pathname);

  return (
    <ul className={"flex items-center gap-2 " + className} aria-label={t.header.language}>
      {LOCALES.map((locale) => {
        const active = locale === current;
        const name = DICTIONARIES[locale].languageName;
        return (
          <li key={locale}>
            <a
              href={localePath(rest, locale)}
              hrefLang={locale}
              lang={locale}
              aria-current={active ? "true" : undefined}
              title={fmt(t.header.switchTo, { language: name })}
              className={
                "group flex items-center gap-2 transition-opacity " +
                (active ? "opacity-100" : "opacity-60 hover:opacity-100")
              }
            >
              <span
                className={
                  "block overflow-hidden rounded-[2px] ring-1 " +
                  (variant === "compact" ? "h-4 w-6 " : "h-[18px] w-[26px] ") +
                  (active ? "ring-white/80" : "ring-black/15")
                }
              >
                <Flag locale={locale} />
              </span>
              {variant === "labeled" ? (
                <span className={"eyebrow " + (active ? "text-ink" : "text-muted")}>{name}</span>
              ) : (
                <span className="sr-only">{name}</span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
