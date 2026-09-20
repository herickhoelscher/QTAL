import "server-only";

/**
 * Leitura automatica do CUB (Custo Unitario Basico da construcao civil).
 *
 * NAO existe API publica e gratuita do CUB — o indice e apurado mensalmente
 * pelos Sinduscons estaduais e publicado na pagina de cada um. O que existe de
 * mais proximo de uma fonte estavel e a tabela de indicadores do Sinduscon
 * Parana Oeste, que traz o CUBOESTE/PR (o indice regional de Toledo, o mais
 * relevante para este cliente) e o CUB/PR estadual, em HTML tabular.
 *
 * Por ser leitura de pagina, e "melhor esforco": se o site mudar de layout, a
 * funcao devolve null, a atualizacao automatica nao acontece e o valor anterior
 * continua no ar. A edicao manual no painel nunca deixa de funcionar.
 */

const SOURCE_URL = "https://sindusconparanaoeste.com.br/indicadores";

export type CubIndex = "CUBOESTE/PR" | "CUB/PR";

export type CubReading = {
  value: number;
  /** Mes de referencia ja formatado, ex.: "agosto/2026". */
  reference: string;
  changePercent: number | null;
  /** Indice efetivamente lido. */
  index: CubIndex;
  sourceUrl: string;
};

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "03/08/2026" -> "agosto/2026" */
function formatReference(date: string): string {
  const match = date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return date;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month}/${match[3]}` : date;
}

/** "2.810,49" ou " 2810,49" -> 2810.49 */
function parseNumber(raw: string): number | null {
  const clean = raw.replace(/\s|&nbsp;/g, "").replace(/\./g, "").replace(",", ".").replace("%", "");
  const value = Number(clean);
  return Number.isFinite(value) ? value : null;
}

/**
 * Le a linha de um indice na tabela de indicadores. A tabela tem a forma
 * <td>CUBOESTE/PR</td><td>03/08/2026</td><td>2810,49</td><td>3,44%</td>...
 * entao ancoramos no nome do indice e pegamos as tres celulas seguintes.
 */
function readRow(html: string, index: CubIndex): CubReading | null {
  const anchor = html.indexOf(index + "</td>");
  if (anchor < 0) return null;

  const cells = [...html.slice(anchor, anchor + 1200).matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)]
    .map((match) => match[1].replace(/<[^>]*>/g, "").trim());

  // O corte comeca no texto do indice, ja depois do <td> dele — entao a
  // primeira celula capturada e a data, nao o nome do indice.
  const [date, value, change] = cells;
  if (!date || !value) return null;

  const parsedValue = parseNumber(value);
  if (parsedValue === null || parsedValue <= 0) return null;

  return {
    value: parsedValue,
    reference: formatReference(date),
    changePercent: change ? parseNumber(change) : null,
    index,
    sourceUrl: SOURCE_URL,
  };
}

/**
 * Busca o CUB mais recente.
 *
 * Qual indice usar e decisao editorial, nao tecnica: o regional (CUBOESTE/PR)
 * e mais preciso para quem anuncia so no oeste do estado; o estadual (CUB/PR)
 * faz mais sentido quando o portal lista imoveis de outras regioes do Parana.
 * Por isso vem das configuracoes, com o outro servindo de reserva caso a linha
 * escolhida nao esteja na pagina.
 */
export async function fetchCub(preferido: CubIndex = "CUBOESTE/PR"): Promise<CubReading | null> {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: {
        // Sem user-agent de navegador, o servidor do sindicato devolve 403.
        "User-Agent": "Mozilla/5.0 (compatible; PortalBot/1.0)",
        Accept: "text/html",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      console.error("[cub] resposta", res.status, "de", SOURCE_URL);
      return null;
    }

    const html = await res.text();
    const reserva: CubIndex = preferido === "CUBOESTE/PR" ? "CUB/PR" : "CUBOESTE/PR";
    return readRow(html, preferido) ?? readRow(html, reserva);
  } catch (error) {
    console.error("[cub] falha ao ler a pagina do Sinduscon:", error);
    return null;
  }
}

/**
 * Le a fonte e grava em ApiSettings. Usada tanto pelo job mensal quanto pelo
 * botao "atualizar agora" do painel.
 *
 * Respeita a chave cubAutoUpdate: se o cliente desligou a atualizacao
 * automatica, o job nao mexe no valor que ele digitou (o botao manual ainda
 * funciona, porque ali a acao e explicita).
 */
export async function refreshCub(
  options: { force?: boolean } = {},
): Promise<{ ok: boolean; reading?: CubReading; reason?: string }> {
  const { prisma } = await import("@/lib/prisma");

  const settings = await prisma.apiSettings.findUnique({ where: { id: "singleton" } });
  if (!options.force && settings && !settings.cubAutoUpdate) {
    return { ok: false, reason: "atualização automática desligada no painel" };
  }

  const reading = await fetchCub((settings?.cubIndex as CubIndex) ?? "CUBOESTE/PR");
  if (!reading) return { ok: false, reason: "não foi possível ler a página do Sinduscon" };

  await prisma.apiSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      cubValue: reading.value,
      cubReference: reading.reference,
      cubChangePercent: reading.changePercent,
      cubSource: "sinduscon",
      cubIndex: reading.index,
      cubUpdatedAt: new Date(),
    },
    update: {
      cubValue: reading.value,
      cubReference: reading.reference,
      cubChangePercent: reading.changePercent,
      cubSource: "sinduscon",
      cubIndex: reading.index,
      cubUpdatedAt: new Date(),
    },
  });

  return { ok: true, reading };
}
