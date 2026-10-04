import { describe, expect, it } from "vitest";
import {
  BRAZIL_STATES,
  canonicalNeighborhood,
  fullPlace,
  isUf,
  mergeNeighborhoods,
  neighborhoodKey,
  placeLabel,
} from "../location";

describe("estados", () => {
  it("tem os 27, sem sigla repetida", () => {
    expect(BRAZIL_STATES).toHaveLength(27);
    expect(new Set(BRAZIL_STATES.map((state) => state.uf)).size).toBe(27);
  });

  it("reconhece a sigla so em maiusculas", () => {
    expect(isUf("PR")).toBe(true);
    expect(isUf("pr")).toBe(false);
    expect(isUf("XX")).toBe(false);
    expect(isUf("")).toBe(false);
  });
});

describe("neighborhoodKey", () => {
  it("ignora maiusculas, acentos e espacos sobrando", () => {
    expect(neighborhoodKey("  Jardim  São Luiz ")).toBe(neighborhoodKey("jardim sao luiz"));
    expect(neighborhoodKey("Centro")).toBe(neighborhoodKey("centro"));
  });

  it("nomes diferentes continuam diferentes", () => {
    expect(neighborhoodKey("Vila Becker")).not.toBe(neighborhoodKey("Vila Industrial"));
  });
});

describe("mergeNeighborhoods", () => {
  it("nao repete e sai em ordem alfabetica", () => {
    expect(mergeNeighborhoods(["Vila Becker", "Centro", "Jardim Gisele", "Centro"])).toEqual([
      "Centro",
      "Jardim Gisele",
      "Vila Becker",
    ]);
  });

  it('"Centro" e "centro" sao o mesmo bairro', () => {
    expect(mergeNeighborhoods(["centro", "Centro"])).toEqual(["Centro"]);
    expect(mergeNeighborhoods(["Centro", "centro"])).toEqual(["Centro"]);
  });

  it("fica a grafia mais usada", () => {
    expect(mergeNeighborhoods(["jardim la salle", "Jardim La Salle", "Jardim La Salle"])).toEqual([
      "Jardim La Salle",
    ]);
  });

  it("no empate, prefere a grafia com acento", () => {
    expect(mergeNeighborhoods(["Linha Sao Luiz", "Linha São Luiz"])).toEqual(["Linha São Luiz"]);
  });

  it("a ordem alfabetica ignora acento e maiuscula", () => {
    expect(mergeNeighborhoods(["Zona norte", "Água Verde", "jardim Panorama"])).toEqual([
      "Água Verde",
      "jardim Panorama",
      "Zona norte",
    ]);
  });

  it("descarta vazios e tira espacos sobrando", () => {
    expect(mergeNeighborhoods([null, undefined, "", "   ", "  Vila   Becker "])).toEqual([
      "Vila Becker",
    ]);
  });
});

describe("canonicalNeighborhood", () => {
  const existing = ["Centro", "Jardim La Salle", "Linha São Luiz"];

  it("usa a grafia que ja existe", () => {
    expect(canonicalNeighborhood("centro", existing)).toBe("Centro");
    expect(canonicalNeighborhood("  linha sao  luiz ", existing)).toBe("Linha São Luiz");
  });

  it("bairro novo entra como foi digitado, sem espacos sobrando", () => {
    expect(canonicalNeighborhood("  Vila   Nova ", existing)).toBe("Vila Nova");
  });

  it("vazio vira null", () => {
    expect(canonicalNeighborhood("   ", existing)).toBeNull();
    expect(canonicalNeighborhood(null, existing)).toBeNull();
  });
});

describe("fullPlace", () => {
  it("do bairro ao estado, pulando o que falta", () => {
    expect(fullPlace({ neighborhood: "Centro", city: "Toledo", state: "PR" })).toBe(
      "Centro, Toledo, PR",
    );
    expect(fullPlace({ state: "PR" })).toBe("PR");
    expect(fullPlace({})).toBeNull();
  });
});

describe("placeLabel", () => {
  it("cidade e bairro, como nos cards; sem cidade, o nome do estado", () => {
    expect(placeLabel({ neighborhood: "Centro", city: "Toledo", state: "PR" })).toBe(
      "Toledo · Centro",
    );
    expect(placeLabel({ city: "Toledo", state: "PR" })).toBe("Toledo");
    expect(placeLabel({ state: "PR" })).toBe("Paraná");
    expect(placeLabel({})).toBeNull();
  });
});
