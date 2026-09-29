import "server-only";
import type { TargetLocale } from "@/lib/i18n/locales";
import { batchTexts } from "@/lib/i18n/overlay";

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
