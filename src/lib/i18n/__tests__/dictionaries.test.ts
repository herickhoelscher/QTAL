import { describe, expect, it } from "vitest";
import { DICTIONARIES } from "../dictionaries";

/** Lista as chaves em formato "a.b.c", para comparar a estrutura inteira. */
function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keys(child, prefix ? prefix + "." + key : key),
  );
}

/** Marcadores {x} de cada texto, para garantir que a traducao nao perdeu nenhum. */
function placeholders(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") {
    return { [prefix]: (value.match(/\{\w+\}/g) ?? []).sort().join(",") };
  }
  return Object.assign(
    {},
    ...Object.entries(value as object).map(([key, child]) =>
      placeholders(child, prefix ? prefix + "." + key : key),
    ),
  );
}

describe("dicionarios", () => {
  const pt = DICTIONARIES.pt;

  for (const locale of ["en", "es"] as const) {
    it(locale + " tem exatamente as chaves do portugues", () => {
      expect(keys(DICTIONARIES[locale]).sort()).toEqual(keys(pt).sort());
    });

    it(locale + " mantem os marcadores {x} de cada texto", () => {
      expect(placeholders(DICTIONARIES[locale])).toEqual(placeholders(pt));
    });

    it(locale + " nao deixou texto vazio", () => {
      const empty = Object.entries(placeholders(DICTIONARIES[locale])).filter(
        ([key]) => !String(key.split(".").reduce<unknown>((o, k) => (o as never)[k], DICTIONARIES[locale])).trim(),
      );
      expect(empty).toEqual([]);
    });
  }
});
