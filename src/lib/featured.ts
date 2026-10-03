/**
 * Filas ordenadas escolhidas no painel: os destaques de cada secao (ate 6) e
 * os slides do carrossel (ate 8). A fila e uma lista de ids em ordem; a
 * posicao gravada no banco sai do indice. Tudo aqui e puro: as server actions
 * so leem a fila, chamam estas funcoes e gravam o resultado.
 */

export const FEATURED_LIMIT = 6;
export const HERO_LIMIT = 8;

export type QueueResult = { ok: true; queue: string[] } | { ok: false; reason: "full" };

/** Entra no fim da fila. Quem ja esta nela nao muda de lugar. */
export function enqueue(queue: string[], id: string, limit: number): QueueResult {
  if (queue.includes(id)) return { ok: true, queue };
  if (queue.length >= limit) return { ok: false, reason: "full" };
  return { ok: true, queue: [...queue, id] };
}

/** Sai da fila; os de tras sobem uma posicao. */
export function dequeue(queue: string[], id: string): string[] {
  return queue.filter((item) => item !== id);
}

/** Troca de lugar com o vizinho de cima (-1) ou de baixo (+1). Nas pontas, nada muda. */
export function move(queue: string[], id: string, delta: -1 | 1): string[] {
  const from = queue.indexOf(id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= queue.length) return queue;
  const next = [...queue];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/**
 * O que gravar para a fila `after` valer, partindo de `before` (posicoes
 * atuais, base 1). Devolve so o que mudou; quem saiu volta a null.
 */
export function rankChanges(
  before: { id: string; rank: number | null }[],
  after: string[],
): { id: string; rank: number | null }[] {
  const current = new Map(before.map((item) => [item.id, item.rank]));
  const changes: { id: string; rank: number | null }[] = [];

  after.forEach((id, index) => {
    if (current.get(id) !== index + 1) changes.push({ id, rank: index + 1 });
  });
  for (const item of before) {
    if (item.rank !== null && !after.includes(item.id)) changes.push({ id: item.id, rank: null });
  }
  return changes;
}
