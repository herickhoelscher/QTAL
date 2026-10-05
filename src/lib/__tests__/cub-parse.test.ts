import { describe, expect, it } from "vitest";
import { newestCub, readRegionalRow, readStatePage, type CubReading } from "../cub-parse";

const REGIONAL_HTML = `
<table><tr><th>Índice</th><th>Mês (Data)</th><th>Valor</th><th>Var.%</th></tr>
<tr><td>CUBOESTE/PR</td><td>03/08/2026</td><td>2810,49</td><td>3,44%</td><td>6,77%</td></tr>
<tr><td>CUB/PR</td><td>03/08/2026</td><td>2730,31</td><td>0,27%</td><td>6,27%</td></tr></table>`;

const STATE_HTML = `
<h1>CUB-PR &#8211; Setembro 2026</h1>
<p>Tabelas mais recentes</p><div><span>CUB-PR</span> <strong>R$ 2.738,93</strong> <em>0.32%</em></div>
<p>Filtre por mês 2026 Setembro 2026 Agosto 2026 Julho 2026</p>`;

describe("readRegionalRow (Sinduscon Paraná Oeste)", () => {
  it("le valor, variacao e mes do indice regional", () => {
    expect(readRegionalRow(REGIONAL_HTML, "CUBOESTE/PR")).toMatchObject({
      value: 2810.49,
      changePercent: 3.44,
      reference: "agosto/2026",
      index: "CUBOESTE/PR",
      origin: "regional",
    });
  });

  it("le o estadual da mesma tabela", () => {
    expect(readRegionalRow(REGIONAL_HTML, "CUB/PR")?.value).toBe(2730.31);
  });

  it("sem a linha, null", () => {
    expect(readRegionalRow("<table></table>", "CUBOESTE/PR")).toBeNull();
  });
});

describe("readStatePage (Sinduscon-PR)", () => {
  it("le mes, valor e variacao com ponto decimal", () => {
    expect(readStatePage(STATE_HTML)).toMatchObject({
      value: 2738.93,
      changePercent: 0.32,
      reference: "setembro/2026",
      index: "CUB/PR",
      origin: "estadual",
    });
  });

  it("pagina sem o bloco, null", () => {
    expect(readStatePage("<p>manutencao</p>")).toBeNull();
  });
});

describe("newestCub", () => {
  const regional = readRegionalRow(REGIONAL_HTML, "CUBOESTE/PR") as CubReading;
  const state = readStatePage(STATE_HTML) as CubReading;

  it("fica com o mes mais recente", () => {
    expect(newestCub(regional, state)?.origin).toBe("estadual");
  });

  it("no empate, vale o regional", () => {
    expect(newestCub(regional, { ...state, period: regional.period })?.origin).toBe("regional");
  });

  it("com uma fonte fora do ar, usa a outra", () => {
    expect(newestCub(null, state)?.origin).toBe("estadual");
    expect(newestCub(regional, null)?.origin).toBe("regional");
    expect(newestCub(null, null)).toBeNull();
  });
});
