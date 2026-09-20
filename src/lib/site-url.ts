/**
 * Endereco publico do site, usado em sitemap, robots, Open Graph e nos links
 * de compartilhamento.
 *
 * A ordem existe para o valor nunca ficar errado por esquecimento:
 *
 * 1. NEXT_PUBLIC_SITE_URL — o dominio definitivo, quando ja houver um.
 * 2. O dominio de producao que a propria Vercel injeta em toda build. Sem isso,
 *    renomear o projeto deixava o sitemap apontando para um endereco que nao
 *    existe mais, e ninguem percebia ate alguem colar o link no WhatsApp.
 * 3. localhost, em desenvolvimento.
 *
 * As duas primeiras precisam do prefixo NEXT_PUBLIC_ porque ShareButtons e
 * VideoFeed rodam no navegador: o valor e embutido no bundle na hora do build.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
