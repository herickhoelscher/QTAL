import "server-only";
import { prisma } from "@/lib/prisma";
import { compareNames, isUf, mergeNeighborhoods } from "@/lib/location";

const IBGE_STATES = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/";

/** Lista de municipios muda quase nunca: 30 dias de cache poupam o IBGE a cada clique. */
const CITIES_REVALIDATE = 60 * 60 * 24 * 30;
const CITIES_TIMEOUT_MS = 8000;

async function requestCities(uf: string): Promise<string[] | null> {
  const res = await fetch(IBGE_STATES + uf + "/municipios", {
    next: { revalidate: CITIES_REVALIDATE },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { nome?: string }[];
  if (!Array.isArray(json)) return null;
  const names = json.map((item) => item.nome).filter((name): name is string => Boolean(name));
  return names.length ? names.sort(compareNames) : null;
}

/**
 * Municipios do estado, com o nome como o IBGE escreve. Null quando o IBGE
 * nao responde: o painel troca a lista por um campo de texto.
 */
export async function fetchCities(uf: string): Promise<string[] | null> {
  if (!isUf(uf)) return null;
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), CITIES_TIMEOUT_MS));
  try {
    return await Promise.race([requestCities(uf), timeout]);
  } catch {
    return null;
  }
}

/** Bairros ja usados na cidade, somando materias, eventos e imoveis. */
export async function listNeighborhoods(uf: string, city: string): Promise<string[]> {
  const cityFilter = { equals: city, mode: "insensitive" as const };
  const select = { neighborhood: true };
  const [articles, events, properties] = await Promise.all([
    prisma.article.findMany({
      where: { state: uf, city: cityFilter, neighborhood: { not: null } },
      select,
    }),
    prisma.event.findMany({
      where: { state: uf, city: cityFilter, neighborhood: { not: null } },
      select,
    }),
    prisma.property.findMany({
      where: { state: uf, city: cityFilter, neighborhood: { not: null } },
      select,
    }),
  ]);
  return mergeNeighborhoods([...articles, ...events, ...properties].map((row) => row.neighborhood));
}
