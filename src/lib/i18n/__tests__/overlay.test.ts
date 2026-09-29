import { describe, expect, it } from "vitest";
import { applyTranslations, batchTexts, hashText } from "../overlay";

describe("hashText", () => {
  it("e estavel para o mesmo texto e muda quando o texto muda", () => {
    expect(hashText("Reforma do centro")).toBe(hashText("Reforma do centro"));
    expect(hashText("Reforma do centro")).not.toBe(hashText("Reforma do Centro"));
  });
});

describe("applyTranslations", () => {
  const rows = [
    { model: "article", recordId: "a1", field: "title", value: "Downtown renovation" },
    { model: "article", recordId: "a1", field: "body", value: "" },
    { model: "event", recordId: "a1", field: "subtitle", value: "de outro modelo" },
  ];

  it("troca o campo traduzido e mantem o portugues onde falta traducao", () => {
    const record = { id: "a1", title: "Reforma do centro", subtitle: "Obras", body: "<p>Texto</p>" };
    applyTranslations("article", [record], ["title", "subtitle", "body"], rows);
    expect(record).toEqual({
      id: "a1",
      title: "Downtown renovation",
      subtitle: "Obras",
      body: "<p>Texto</p>",
    });
  });

  it("nao preenche campo que esta vazio no original", () => {
    const record = { id: "a1", title: null as string | null };
    applyTranslations("article", [record], ["title"], rows);
    expect(record.title).toBeNull();
  });
});

describe("batchTexts", () => {
  it("respeita o limite de textos por lote e a ordem", () => {
    const texts = Array.from({ length: 5 }, (_, i) => "t" + i);
    expect(batchTexts(texts, 2)).toEqual([["t0", "t1"], ["t2", "t3"], ["t4"]]);
  });

  it("respeita o limite de bytes, mas nunca deixa um texto grande sem lote", () => {
    expect(batchTexts(["aaaa", "bbbb", "cc"], 50, 6)).toEqual([["aaaa"], ["bbbb", "cc"]]);
    expect(batchTexts(["x".repeat(20)], 50, 6)).toEqual([["x".repeat(20)]]);
  });
});
