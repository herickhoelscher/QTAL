/**
 * Capa montada pelo site: o painel guarda so a foto (sem texto) e o titulo e
 * o subtitulo digitados; o site escreve por cima o nome da revista. Assim o
 * texto sai nitido em qualquer zoom e traduzido em ingles e espanhol.
 */

export type CoverText = {
  /** Nome da revista no topo: o nome do site em Configuracoes. */
  masthead: string;
  /** Logo do cliente, quando houver: substitui o nome no topo. */
  logoUrl: string | null;
  title: string;
  subtitle: string | null;
};

/** Uma pagina do leitor folheavel. Com `cover`, o site escreve a capa sobre a imagem. */
export type FlipPage = { url: string; alt: string | null; cover?: CoverText };

type Brand = { siteName: string; clientLogoUrl: string | null };

type CoverFields = {
  title: string;
  coverImage: string | null;
  coverTitle: string | null;
  coverSubtitle: string | null;
};

/** Texto da capa; null quando a edicao nao tem titulo de capa (a foto vale como esta). */
export function coverText(issue: CoverFields, brand: Brand): CoverText | null {
  const title = issue.coverTitle?.trim();
  if (!title) return null;
  return {
    masthead: brand.siteName,
    logoUrl: brand.clientLogoUrl,
    title,
    subtitle: issue.coverSubtitle?.trim() || null,
  };
}

/** Paginas do leitor: a capa montada (quando ha titulo de capa) e depois as enviadas. */
export function flipPages(
  issue: CoverFields & { pages: { url: string; altText: string | null }[] },
  brand: Brand,
): FlipPage[] {
  const text = coverText(issue, brand);
  const uploaded = issue.pages.map((page) => ({ url: page.url, alt: page.altText }));
  if (!text) return uploaded;
  return [{ url: issue.coverImage ?? "", alt: text.title, cover: text }, ...uploaded];
}

/** Tamanho do nome no topo: nomes curtos ficam enormes, longos encolhem para caber. */
export function mastheadSize(masthead: string): number {
  return Math.min(18, 135 / Math.max(masthead.length, 1));
}
