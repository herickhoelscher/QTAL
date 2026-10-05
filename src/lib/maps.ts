/**
 * Mapa do imovel. O Google so deixa abrir dentro de outro site o mapa
 * "incorporado"; o link de compartilhar (maps.app.goo.gl) e o da barra de
 * endereco sao recusados. Aqui qualquer link do Google Maps vira um mapa
 * incorporavel, sem chave de API.
 */

const EMBED_ZOOM = 15;

function embedUrl(query: string, zoom = EMBED_ZOOM): string {
  return "https://www.google.com/maps?q=" + encodeURIComponent(query) + "&z=" + zoom + "&output=embed";
}

function parse(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isGoogleMaps(url: URL): boolean {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "maps.google.com" || /^maps\.google\.[a-z.]+$/.test(host)) return true;
  return /^google\.[a-z.]+$/.test(host) && url.pathname.startsWith("/maps");
}

/** Link curto de compartilhar: so da para ler depois de seguir o redirecionamento. */
export function isShortMapLink(value: string): boolean {
  const url = parse(value.trim());
  if (!url) return false;
  return (
    url.hostname === "maps.app.goo.gl" ||
    (url.hostname === "goo.gl" && url.pathname.startsWith("/maps"))
  );
}

/**
 * Converte o que foi colado no painel (link do Google Maps ou o codigo
 * <iframe> do "Incorporar um mapa") no endereco que o site abre no quadro.
 * Null quando nao da para montar um mapa.
 */
export function toMapEmbedUrl(input: string | null | undefined): string | null {
  let value = (input ?? "").trim();
  const iframe = value.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (iframe) value = iframe[1].replace(/&amp;/g, "&");

  const url = parse(value);
  if (!url || !isGoogleMaps(url)) return null;

  if (url.pathname.startsWith("/maps/embed")) return url.toString();
  if (url.searchParams.get("output") === "embed") return url.toString();

  const zoomMatch = url.pathname.match(/@-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?,(\d+(?:\.\d+)?)z/);
  const zoom = zoomMatch ? Math.round(Number(zoomMatch[1])) : EMBED_ZOOM;

  // O pino do lugar (!3d lat !4d lng) e mais exato que o centro do mapa (@lat,lng).
  const pin = url.pathname.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (pin) return embedUrl(pin[1] + "," + pin[2], zoom);

  const center = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (center) return embedUrl(center[1] + "," + center[2], zoom);

  const query = url.searchParams.get("q") ?? url.searchParams.get("query");
  if (query) return embedUrl(query);

  const place = url.pathname.match(/\/maps\/place\/([^/]+)/);
  if (place) return embedUrl(decodeURIComponent(place[1].replace(/\+/g, " ")));

  return null;
}

/** Mapa pelo endereco escrito no cadastro, quando nao ha link de mapa valido. */
export function addressMapUrl(parts: (string | null | undefined)[]): string | null {
  const address = parts.map((part) => part?.trim()).filter(Boolean).join(", ");
  return address ? embedUrl(address, 16) : null;
}

/** Segue o link curto de compartilhar ate o endereco completo do Google Maps. */
export async function resolveShortMapLink(value: string): Promise<string | null> {
  let current = value.trim();
  for (let hop = 0; hop < 4 && isShortMapLink(current); hop++) {
    try {
      const response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });
      const location = response.headers.get("location");
      if (!location) return null;
      current = new URL(location, current).toString();
    } catch {
      return null;
    }
  }
  return isShortMapLink(current) ? null : current;
}
