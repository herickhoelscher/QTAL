import { createHash } from "node:crypto";

/**
 * Partes puras da traducao de conteudo — sem banco nem rede, para poderem ser
 * testadas isoladamente.
 */

export type TranslationRow = { model: string; recordId: string; field: string; value: string };

export function hashText(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/** Converte entidades HTML (&amp;, &#39;, &#x27;...) no caractere correspondente. */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
    }
    return ENTITIES[code.toLowerCase()] ?? whole;
  });
}

export function escapeHtmlText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const BLOCK_TAG =
  /(<\/?(?:p|h[1-6]|blockquote|ul|ol|li|div|section|figure|figcaption|table|thead|tbody|tr|td|th|pre|br|hr)\b[^>]*>)/i;

/**
 * Separa um HTML nas tags de bloco (paragrafo, titulo, citacao, lista...) e no
 * conteudo entre elas, na ordem. As tags de dentro da frase (negrito, italico,
 * link) ficam junto do texto: o tradutor as preserva, e a frase inteira chega
 * com contexto — traduzir "conta" sozinho, fora da frase, sai errado.
 */
export function splitHtml(html: string): { tag: boolean; value: string }[] {
  return html
    .split(BLOCK_TAG)
    .filter((part) => part !== "")
    .map((part) => ({ tag: BLOCK_TAG.test(part) && /^<[^>]+>$/.test(part), value: part }));
}

/**
 * Quebra um texto em pedacos de ate maxBytes, preferindo o fim de frase e,
 * na falta dele, o espaco. Juntar os pedacos com espaco devolve o texto.
 */
export function chunkText(text: string, maxBytes: number): string[] {
  const size = (value: string) => Buffer.byteLength(value, "utf8");
  if (size(text) <= maxBytes) return [text];

  // Corta so em pontuacao seguida de espaco: "4.2 mil" e "site.com" ficam inteiros.
  const sentences = text.split(/(?<=[.!?…]["”’)]*)(\s+)/);
  const chunks: string[] = [];
  let current = "";
  const push = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };

  for (const sentence of sentences) {
    if (size(current + sentence) <= maxBytes) {
      current += sentence;
      continue;
    }
    push();
    if (size(sentence) <= maxBytes) {
      current = sentence;
      continue;
    }
    // Frase longa demais: quebra por palavra.
    for (const word of sentence.split(/(\s+)/)) {
      if (size(current + word) > maxBytes) push();
      current += word;
    }
  }
  push();
  return chunks;
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
