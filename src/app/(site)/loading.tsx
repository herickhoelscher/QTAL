/**
 * Esqueleto exibido enquanto a rota carrega. As caixas têm as mesmas proporções
 * do conteúdo real, para a troca não empurrar o layout (CLS).
 */
export default function Loading() {
  return (
    <div className="container-portal py-12 md:py-20" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando conteúdo…</span>

      <div className="h-10 w-2/3 max-w-md animate-pulse bg-surface-alt md:h-14" />

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <div className="aspect-[4/3] w-full animate-pulse bg-surface-alt" />
            <div className="mt-4 h-3 w-24 animate-pulse bg-surface-alt" />
            <div className="mt-3 h-6 w-full animate-pulse bg-surface-alt" />
            <div className="mt-2 h-6 w-4/5 animate-pulse bg-surface-alt" />
          </div>
        ))}
      </div>
    </div>
  );
}
