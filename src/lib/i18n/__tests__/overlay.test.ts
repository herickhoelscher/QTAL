import { describe, expect, it } from "vitest";
import {
  applyTranslations,
  batchTexts,
  chunkText,
  decodeEntities,
  escapeHtmlText,
  hashText,
  splitHtml,
} from "../overlay";

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

describe("splitHtml", () => {
  it("corta nos blocos, mantem negrito e link dentro da frase e nao perde nada", () => {
    const html =
      '<p>Um <strong>forte</strong> &amp; <a href="/x">claro</a>.</p><h2>Título</h2><ul><li>Item</li></ul>';
    const parts = splitHtml(html);
    expect(parts.map((part) => part.value).join("")).toBe(html);
    expect(parts.filter((part) => !part.tag).map((part) => part.value)).toEqual([
      'Um <strong>forte</strong> &amp; <a href="/x">claro</a>.',
      "Título",
      "Item",
    ]);
  });
});

describe("decodeEntities / escapeHtmlText", () => {
  it("decodifica e reescapa texto de HTML", () => {
    expect(decodeEntities("A &amp; B &lt;3 &#39;x&#x27; &quot;y&quot;")).toBe("A & B <3 'x' \"y\"");
    expect(escapeHtmlText("A & B <3")).toBe("A &amp; B &lt;3");
  });
});

describe("chunkText", () => {
  it("devolve o texto inteiro quando cabe", () => {
    expect(chunkText("Frase curta.", 50)).toEqual(["Frase curta."]);
  });

  it("quebra no fim da frase e respeita o limite", () => {
    const text = "Primeira frase aqui. Segunda frase um pouco maior. Terceira.";
    const chunks = chunkText(text, 30);
    expect(chunks.every((chunk) => Buffer.byteLength(chunk) <= 30)).toBe(true);
    expect(chunks.join(" ")).toBe(text);
  });

  it("nao corta numero decimal nem endereco com ponto", () => {
    const text = "Recebeu 4.2 mil pessoas no site.com hoje. Segunda frase aqui.";
    const chunks = chunkText(text, 45);
    expect(chunks[0]).toBe("Recebeu 4.2 mil pessoas no site.com hoje.");
    expect(chunks.join(" ")).toBe(text);
  });

  it("quebra por palavra quando uma frase sozinha passa do limite", () => {
    const chunks = chunkText("palavra ".repeat(20).trim(), 30);
    expect(chunks.every((chunk) => Buffer.byteLength(chunk) <= 30)).toBe(true);
    expect(chunks.join(" ")).toBe("palavra ".repeat(20).trim());
  });
});
