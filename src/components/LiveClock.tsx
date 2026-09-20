"use client";

import { useEffect, useState } from "react";

const FORMAT = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

/** Data e hora renderizadas no cliente, para nao variarem com o cache da pagina. */
export function LiveClock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNow(FORMAT.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="shrink-0 font-semibold tabular-nums" suppressHydrationWarning>
      {now ?? "--"}
    </span>
  );
}
