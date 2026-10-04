/**
 * Localizacao do conteudo: estado, cidade e bairro. Os estados sao fixos; as
 * cidades vem do IBGE (location-db.ts); os bairros sao os ja cadastrados
 * naquela cidade, somando materias, eventos e imoveis. Tudo aqui e puro.
 */

export const BRAZIL_STATES = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
] as const;

/** Estado sugerido em conteudo novo: o portal e de Toledo. */
export const DEFAULT_UF = "PR";

export function isUf(value: string): boolean {
  return BRAZIL_STATES.some((state) => state.uf === value);
}

export function stateName(uf: string): string | null {
  return BRAZIL_STATES.find((state) => state.uf === uf)?.name ?? null;
}

/** Tira espacos das pontas e junta os repetidos no meio. */
export function collapseSpaces(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/** Chave de comparacao: "Linha São Luiz" e "linha sao  luiz" sao o mesmo bairro. */
export function neighborhoodKey(name: string): string {
  return collapseSpaces(name)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function accentCount(value: string): number {
  return value.normalize("NFD").replace(/[^̀-ͯ]/g, "").length;
}

/** Entre duas grafias usadas o mesmo numero de vezes: maiuscula e acento ganham. */
function betterSpelling(a: string, b: string): string {
  const upper = (value: string) => value[0] !== value[0].toLowerCase();
  if (upper(a) !== upper(b)) return upper(a) ? a : b;
  return accentCount(b) > accentCount(a) ? b : a;
}

export function compareNames(a: string, b: string): number {
  return a.localeCompare(b, "pt-BR", { sensitivity: "base" });
}

/**
 * Lista de bairros para escolher: sem repetir ("Centro" e "centro" sao um so),
 * com a grafia mais usada e em ordem alfabetica.
 */
export function mergeNeighborhoods(names: (string | null | undefined)[]): string[] {
  const groups = new Map<string, Map<string, number>>();
  for (const raw of names) {
    const name = collapseSpaces(raw ?? "");
    if (!name) continue;
    const key = neighborhoodKey(name);
    const spellings = groups.get(key) ?? new Map<string, number>();
    spellings.set(name, (spellings.get(name) ?? 0) + 1);
    groups.set(key, spellings);
  }

  const chosen = [...groups.values()].map((spellings) =>
    [...spellings.entries()].reduce((best, current) => {
      if (current[1] !== best[1]) return current[1] > best[1] ? current : best;
      return betterSpelling(best[0], current[0]) === best[0] ? best : current;
    })[0],
  );

  return chosen.sort(compareNames);
}

/**
 * Bairro digitado no painel: se ja existe com outra grafia naquela cidade,
 * grava a que ja existe, para a lista nao ganhar "Centro" e "centro".
 */
export function canonicalNeighborhood(
  input: string | null | undefined,
  existing: string[],
): string | null {
  const name = collapseSpaces(input ?? "");
  if (!name) return null;
  const key = neighborhoodKey(name);
  return existing.find((item) => neighborhoodKey(item) === key) ?? name;
}

/** "Centro, Toledo, PR": endereco completo, para o painel. */
export function fullPlace(place: {
  state?: string | null;
  city?: string | null;
  neighborhood?: string | null;
}): string | null {
  return [place.neighborhood, place.city, place.state].filter(Boolean).join(", ") || null;
}

/** "Toledo · Centro", como nos cards. Sem cidade, o nome do estado. */
export function placeLabel(place: {
  state?: string | null;
  city?: string | null;
  neighborhood?: string | null;
}): string | null {
  const parts = [place.city, place.neighborhood].filter(Boolean);
  if (parts.length) return parts.join(" · ");
  return place.state ? stateName(place.state) ?? place.state : null;
}
