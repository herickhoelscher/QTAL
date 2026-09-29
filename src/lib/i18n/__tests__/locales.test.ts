import { describe, expect, it } from "vitest";
import { fmt, isLocale, localeFromPath, localePath, stripLocale, toLocale } from "../locales";

describe("isLocale / toLocale", () => {
  it("aceita pt, en e es", () => {
    expect(["pt", "en", "es"].every(isLocale)).toBe(true);
  });

  it("recusa o resto e cai no portugues", () => {
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("EN")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(toLocale("fr")).toBe("pt");
    expect(toLocale(undefined)).toBe("pt");
  });
});

describe("localePath", () => {
  it("nao prefixa o portugues", () => {
    expect(localePath("/materias", "pt")).toBe("/materias");
    expect(localePath("/", "pt")).toBe("/");
  });

  it("prefixa ingles e espanhol", () => {
    expect(localePath("/materias/reforma", "en")).toBe("/en/materias/reforma");
    expect(localePath("/", "es")).toBe("/es");
    expect(localePath("/materias?categoria=x", "en")).toBe("/en/materias?categoria=x");
  });

  it("troca um prefixo existente em vez de empilhar", () => {
    expect(localePath("/en/materias", "es")).toBe("/es/materias");
    expect(localePath("/es/materias", "pt")).toBe("/materias");
  });

  it("deixa passar link externo, mailto, tel e ancora", () => {
    for (const href of ["https://wa.me/55", "mailto:a@b.com", "tel:4599", "#topo", "//cdn.x/y"]) {
      expect(localePath(href, "en")).toBe(href);
    }
  });

  it("nao prefixa o painel nem a API", () => {
    expect(localePath("/admin", "en")).toBe("/admin");
    expect(localePath("/admin/materias", "es")).toBe("/admin/materias");
    expect(localePath("/api/materias/x/view", "en")).toBe("/api/materias/x/view");
    // mas nao confunde com uma rota que so comeca parecido
    expect(localePath("/administracao", "en")).toBe("/en/administracao");
  });
});

describe("stripLocale / localeFromPath", () => {
  it("tira o prefixo, inclusive o /pt interno do proxy", () => {
    expect(stripLocale("/pt/materias")).toBe("/materias");
    expect(stripLocale("/en")).toBe("/");
    expect(stripLocale("/pt")).toBe("/");
    expect(stripLocale("/materias")).toBe("/materias");
    expect(stripLocale("/entrevistas")).toBe("/entrevistas");
  });

  it("le o idioma do caminho do navegador", () => {
    expect(localeFromPath("/en/videos")).toBe("en");
    expect(localeFromPath("/es")).toBe("es");
    expect(localeFromPath("/videos")).toBe("pt");
    expect(localeFromPath("/entrevistas")).toBe("pt");
  });
});

describe("fmt", () => {
  it("preenche os marcadores e preserva os desconhecidos", () => {
    expect(fmt("{n} quartos", { n: 3 })).toBe("3 quartos");
    expect(fmt("Oi {nome}", {})).toBe("Oi {nome}");
  });
});
