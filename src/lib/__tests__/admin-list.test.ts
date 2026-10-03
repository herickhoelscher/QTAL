import { describe, expect, it } from "vitest";
import { listHref, parseListParams, skipOf } from "../admin-list";

const options = { sortable: ["updatedAt", "viewCount"], defaultSort: "updatedAt" };

describe("parseListParams", () => {
  it("sem parametros usa a ordem padrao e a pagina 1", () => {
    expect(parseListParams({}, options)).toEqual({
      q: "",
      page: 1,
      take: 20,
      sort: "updatedAt",
      dir: "desc",
    });
  });

  it("le busca, ordem e pagina", () => {
    const params = parseListParams({ q: "  reforma ", ordem: "viewCount:asc", pagina: "3" }, options);
    expect(params).toMatchObject({ q: "reforma", sort: "viewCount", dir: "asc", page: 3 });
    expect(skipOf(params)).toBe(40);
  });

  it("recusa campo fora da lista e pagina invalida", () => {
    const params = parseListParams({ ordem: "passwordHash:asc", pagina: "-2" }, options);
    expect(params).toMatchObject({ sort: "updatedAt", dir: "desc", page: 1 });
  });

  it("recusa direcao invalida", () => {
    expect(parseListParams({ ordem: "viewCount:lado" }, options).dir).toBe("desc");
  });
});

describe("listHref", () => {
  const params = parseListParams({ q: "casa", ordem: "viewCount:asc", pagina: "2" }, options);

  it("mantem os parametros atuais", () => {
    expect(listHref("/admin/materias", params)).toBe(
      "/admin/materias?q=casa&ordem=viewCount%3Aasc&pagina=2",
    );
  });

  it("omite a pagina 1 e a busca vazia", () => {
    expect(listHref("/admin/materias", params, { page: 1, q: "" })).toBe(
      "/admin/materias?ordem=viewCount%3Aasc",
    );
  });
});
