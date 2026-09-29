"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { LOCALE_TAG } from "@/lib/i18n/locales";

/** Data e hora renderizadas no cliente, para nao variarem com o cache da pagina. */
export function LiveClock() {
  const { locale } = useI18n();
  const [now, setNow] = useState<string | null>(null);

  // A hora continua a de Brasilia em qualquer idioma: o portal e da regiao.
  const format = useMemo(
    () =>
      new Intl.DateTimeFormat(LOCALE_TAG[locale], {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      }),
    [locale],
  );

  useEffect(() => {
    const tick = () => setNow(format.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [format]);

  return (
    <span className="shrink-0 font-semibold tabular-nums" suppressHydrationWarning>
      {now ?? "--"}
    </span>
  );
}
