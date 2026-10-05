import "server-only";
import {
  REGIONAL_SOURCE_URL,
  STATE_SOURCE_URL,
  newestCub,
  readRegionalRow,
  readStatePage,
  type CubIndex,
  type CubReading,
} from "@/lib/cub-parse";

/**
 * Leitura automatica do CUB (Custo Unitario Basico da construcao civil).
 *
 * NAO existe API publica e gratuita do CUB: o indice e apurado mensalmente
 * pelos Sinduscons e publicado nas paginas de cada um. Lemos duas:
 *
 * - a tabela do Sinduscon Parana Oeste (CUBOESTE/PR, o regional de Toledo, e
 *   o CUB/PR), que e a preferida;
 * - a pagina do CUB-PR do Sinduscon-PR, que costuma sair antes.
 *
 * Fica a mais recente; no empate, a regional. Por ser leitura de pagina, e
 * "melhor esforco": se as duas mudarem de layout, nada e gravado e o valor
 * anterior continua no ar. A edicao manual no painel nunca deixa de funcionar.
 */

export type { CubIndex, CubReading };

/** Valor de cubSource gravado quando o CUB veio da pagina estadual. */
export const STATE_SOURCE = "sinduscon-pr";

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        // Sem user-agent de navegador, os servidores dos sindicatos devolvem 403.
        "User-Agent": "Mozilla/5.0 (compatible; PortalBot/1.0)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[cub] resposta", res.status, "de", url);
      return null;
    }
    return await res.text();
  } catch (error) {
    console.error("[cub] falha ao ler", url, error);
    return null;
  }
}

/**
 * Busca o CUB mais recente. O indice regional escolhido no painel e o
 * preferido; o outro indice da mesma tabela serve de reserva se a linha sumir.
 */
export async function fetchCub(preferido: CubIndex = "CUBOESTE/PR"): Promise<CubReading | null> {
  const [regionalHtml, stateHtml] = await Promise.all([
    fetchPage(REGIONAL_SOURCE_URL),
    fetchPage(STATE_SOURCE_URL),
  ]);
  const reserva: CubIndex = preferido === "CUBOESTE/PR" ? "CUB/PR" : "CUBOESTE/PR";
  const regional = regionalHtml
    ? (readRegionalRow(regionalHtml, preferido) ?? readRegionalRow(regionalHtml, reserva))
    : null;
  const state = stateHtml ? readStatePage(stateHtml) : null;
  return newestCub(regional, state);
}

/**
 * Le as fontes e grava em ApiSettings. Usada pelo job diario e pelo botao
 * "atualizar agora" do painel. So grava quando o valor ou o mes mudam, entao
 * a data de "ultima atualizacao" e a da ultima mudanca de verdade.
 *
 * Respeita a chave cubAutoUpdate: se o cliente desligou a atualizacao
 * automatica, o job nao mexe no valor que ele digitou (o botao manual ainda
 * funciona, porque ali a acao e explicita).
 */
export async function refreshCub(
  options: { force?: boolean } = {},
): Promise<{ ok: boolean; changed?: boolean; reading?: CubReading; reason?: string }> {
  const { prisma } = await import("@/lib/prisma");

  const settings = await prisma.apiSettings.findUnique({ where: { id: "singleton" } });
  if (!options.force && settings && !settings.cubAutoUpdate) {
    return { ok: false, reason: "atualização automática desligada no painel" };
  }

  const reading = await fetchCub((settings?.cubIndex as CubIndex) ?? "CUBOESTE/PR");
  if (!reading) return { ok: false, reason: "não foi possível ler as páginas do Sinduscon" };

  const source = reading.origin === "estadual" ? STATE_SOURCE : "sinduscon";
  const unchanged =
    settings?.cubValue !== null &&
    settings?.cubValue !== undefined &&
    Number(settings.cubValue) === reading.value &&
    settings.cubReference === reading.reference &&
    settings.cubSource === source;
  if (unchanged && !options.force) return { ok: true, changed: false, reading };

  // cubIndex nao e gravado: e a preferencia do painel, nao o indice lido.
  const data = {
    cubValue: reading.value,
    cubReference: reading.reference,
    cubChangePercent: reading.changePercent,
    cubSource: source,
    cubUpdatedAt: new Date(),
  };
  await prisma.apiSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  return { ok: true, changed: true, reading };
}
