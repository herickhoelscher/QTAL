import { describe, expect, it } from "vitest";
import { addressMapUrl, isShortMapLink, toMapEmbedUrl } from "../maps";

const embed = (query: string, zoom = 15) =>
  "https://www.google.com/maps?q=" + encodeURIComponent(query) + "&z=" + zoom + "&output=embed";

describe("toMapEmbedUrl", () => {
  it("link de incorporar do Google fica como esta", () => {
    const url = "https://www.google.com/maps/embed?pb=!1m18!1m12";
    expect(toMapEmbedUrl(url)).toBe(url);
  });

  it("aceita o codigo <iframe> inteiro colado do Google", () => {
    const html =
      '<iframe src="https://www.google.com/maps/embed?pb=!1m18!2m3" width="600" height="450"></iframe>';
    expect(toMapEmbedUrl(html)).toBe("https://www.google.com/maps/embed?pb=!1m18!2m3");
  });

  it("link de lugar usa o pino exato (!3d !4d)", () => {
    const url =
      "https://www.google.com/maps/place/Mal.+C%C3%A2ndido+Rondon,+PR/@-24.5501798,-54.0615668,13z/data=!3m1!4b1!4m6!3m5!1s0x94f:0xa35!8m2!3d-24.5561687!4d-54.0590073!16s";
    expect(toMapEmbedUrl(url)).toBe(embed("-24.5561687,-54.0590073", 13));
  });

  it("sem pino, usa o centro do mapa (@lat,lng)", () => {
    expect(toMapEmbedUrl("https://www.google.com/maps/@-24.7246,-53.7412,17z")).toBe(
      embed("-24.7246,-53.7412", 17),
    );
  });

  it("link de busca (?q=) vira mapa da busca", () => {
    expect(toMapEmbedUrl("https://maps.google.com/?q=Rua+XV,+Toledo")).toBe(embed("Rua XV, Toledo"));
  });

  it("link de lugar sem coordenadas usa o nome do lugar", () => {
    expect(toMapEmbedUrl("https://www.google.com/maps/place/Parque+Ecol%C3%B3gico+Diva+Paim+Barth")).toBe(
      embed("Parque Ecológico Diva Paim Barth"),
    );
  });

  it("o que nao e do Google Maps nao vira mapa", () => {
    expect(toMapEmbedUrl("https://example.com/mapa")).toBeNull();
    expect(toMapEmbedUrl("qualquer coisa")).toBeNull();
    expect(toMapEmbedUrl("")).toBeNull();
  });

  it("link curto de compartilhar precisa ser aberto antes", () => {
    expect(toMapEmbedUrl("https://maps.app.goo.gl/69Ms8UW1ezHaKxiW7")).toBeNull();
    expect(isShortMapLink("https://maps.app.goo.gl/69Ms8UW1ezHaKxiW7")).toBe(true);
    expect(isShortMapLink("https://goo.gl/maps/abc")).toBe(true);
    expect(isShortMapLink("https://www.google.com/maps/place/x")).toBe(false);
  });
});

describe("addressMapUrl", () => {
  it("monta o mapa pelo endereco, cidade e estado", () => {
    expect(addressMapUrl(["Rua XV, 100", "Jardim Gisele", "Toledo", "PR"])).toBe(
      embed("Rua XV, 100, Jardim Gisele, Toledo, PR", 16),
    );
  });

  it("sem nada preenchido, sem mapa", () => {
    expect(addressMapUrl([null, "", undefined])).toBeNull();
  });
});
