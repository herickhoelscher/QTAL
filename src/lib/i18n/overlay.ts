import { createHash } from "node:crypto";

/**
 * Partes puras da traducao de conteudo — sem banco nem rede, para poderem ser
 * testadas isoladamente.
 */

export type TranslationRow = { model: string; recordId: string; field: string; value: string };

export function hashText(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * Sobrepoe as traducoes nos registros, no proprio objeto. Campo sem traducao
 * (ou com traducao vazia) continua em portugues.
 */
export function applyTranslations(
  model: string,
  records: { id: string }[],
  fields: readonly string[],
  rows: TranslationRow[],
): void {
  const byKey = new Map<string, string>();
  for (const row of rows) {
    if (row.model === model && row.value) byKey.set(row.recordId + "\u0000" + row.field, row.value);
  }
  for (const record of records) {
    const target = record as Record<string, unknown>;
    for (const field of fields) {
      if (typeof target[field] !== "string" || !target[field]) continue;
      const value = byKey.get(record.id + "\u0000" + field);
      if (value) target[field] = value;
    }
  }
}

// Limites da API: ate 50 textos e 128 KiB por requisicao. Ficamos abaixo.
const MAX_TEXTS = 50;
const MAX_BYTES = 100_000;

/** Agrupa os textos em lotes que respeitam os limites do DeepL, mantendo a ordem. */
export function batchTexts(texts: string[], maxTexts = MAX_TEXTS, maxBytes = MAX_BYTES): string[][] {
  const batches: string[][] = [];
  let current: string[] = [];
  let bytes = 0;
  for (const text of texts) {
    const size = Buffer.byteLength(text, "utf8");
    if (current.length && (current.length >= maxTexts || bytes + size > maxBytes)) {
      batches.push(current);
      current = [];
      bytes = 0;
    }
    current.push(text);
    bytes += size;
  }
  if (current.length) batches.push(current);
  return batches;
}
