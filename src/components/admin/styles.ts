/**
 * Classes compartilhadas do painel. Ficam fora dos arquivos "use client" para
 * poderem ser usadas tambem nos componentes de servidor.
 */

export const CONTROL =
  "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-ink focus:ring-1 focus:ring-ink";

export const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-dark disabled:opacity-60";

export const SECONDARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink";
