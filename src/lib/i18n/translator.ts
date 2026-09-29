import "server-only";
import type { TargetLocale } from "@/lib/i18n/locales";
import { batchTexts, chunkText, decodeEntities, splitHtml } from "@/lib/i18n/overlay";

export type TranslateOptions = {
  /** Texto com tags (corpo das materias): o DeepL preserva a marcacao. */
  html: boolean;
};

export interface Translator {
  translate(texts: string[], target: TargetLocale, options: TranslateOptions): Promise<string[]>;
}

const DEEPL_TARGET: Record<TargetLocale, string> = {
  en: "EN-US",
  es: "ES",
};

/**
 * DeepL. Chaves da faixa gratis terminam em ":fx" e usam outro endereco que as
 * pagas — o endereco sai da propria chave, sem configuracao extra.
 */
export function deeplTranslator(apiKey: string): Translator {
  const endpoint = apiKey.trim().endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  return {
    async translate(texts, target, { html }) {
      const out: string[] = [];
      for (const batch of batchTexts(texts)) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: "DeepL-Auth-Key " + apiKey.trim(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: batch,
            source_lang: "PT",
            target_lang: DEEPL_TARGET[target],
            ...(html ? { tag_handling: "html" } : {}),
          }),
          signal: AbortSignal.timeout(20_000),
          cache: "no-store",
        });
        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          throw new Error("DeepL " + response.status + ": " + detail.slice(0, 200));
        }
        const json = (await response.json()) as { translations: { text: string }[] };
        out.push(...json.translations.map((item) => item.text));
      }
      return out;
    },
  };
}

/** Promise.all com no maximo `limit` tarefas ao mesmo tempo, mantendo a ordem. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

/** Erro de cota: interrompe a traducao em lote em vez de insistir. */
export class TranslatorQuotaError extends Error {}

const MYMEMORY_TARGET: Record<TargetLocale, string> = {
  en: "en-US",
  es: "es-ES",
};

// A API aceita ate 500 bytes por consulta; a margem cobre a codificacao.
const MYMEMORY_MAX_BYTES = 450;

/**
 * MyMemory: API gratuita que dispensa chave, usada quando o DeepL nao esta
 * configurado. Limite de 50 mil caracteres por dia quando a consulta informa
 * um e-mail de contato (5 mil sem ele). O HTML vai dividido nos blocos
 * (paragrafos, titulos, citacoes), com negrito e links dentro da frase — o
 * servico os preserva — e as tags de bloco voltam intactas.
 */
export function myMemoryTranslator(contactEmail?: string | null): Translator {
  async function translateChunk(text: string, target: TargetLocale, html: boolean): Promise<string> {
    const params = new URLSearchParams({
      q: text,
      langpair: "pt-BR|" + MYMEMORY_TARGET[target],
    });
    if (contactEmail) params.set("de", contactEmail);

    const response = await fetch("https://api.mymemory.translated.net/get?" + params, {
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
    if (response.status === 429) throw new TranslatorQuotaError("MyMemory: cota diaria esgotada");
    if (!response.ok) throw new Error("MyMemory " + response.status);

    const json = (await response.json()) as {
      responseStatus: number | string;
      responseDetails?: string;
      quotaFinished?: boolean;
      responseData?: { translatedText?: string };
    };
    if (json.quotaFinished) throw new TranslatorQuotaError("MyMemory: cota diaria esgotada");
    if (Number(json.responseStatus) !== 200 || !json.responseData?.translatedText) {
      throw new Error("MyMemory: " + (json.responseDetails ?? json.responseStatus));
    }
    // Em HTML a resposta ja vem como HTML (com as tags de frase preservadas).
    const translated = json.responseData.translatedText;
    return html ? translated : decodeEntities(translated);
  }

  /** Traduz um trecho em pedacos de ate 450 bytes, preservando o espaco nas pontas. */
  async function translateText(text: string, target: TargetLocale, html: boolean): Promise<string> {
    const trimmed = text.trim();
    if (!/\p{L}/u.test(trimmed.replace(/<[^>]*>/g, ""))) return text;
    const lead = text.slice(0, text.indexOf(trimmed));
    const tail = text.slice(text.indexOf(trimmed) + trimmed.length);
    const parts: string[] = [];
    for (const chunk of chunkText(trimmed, MYMEMORY_MAX_BYTES)) {
      parts.push(await translateChunk(chunk, target, html));
    }
    return lead + parts.join(" ") + tail;
  }

  return {
    async translate(texts, target, { html }) {
      const out: string[] = [];
      for (const text of texts) {
        if (!html) {
          out.push(await translateText(text, target, false));
          continue;
        }
        const pieces = splitHtml(text);
        const translated = await mapLimit(pieces, 4, async (piece) =>
          piece.tag ? piece.value : translateText(piece.value, target, true),
        );
        out.push(translated.join(""));
      }
      return out;
    },
  };
}
