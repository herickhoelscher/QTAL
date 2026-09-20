const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "u", "s", "h2", "h3", "h4",
  "ul", "ol", "li", "blockquote", "a", "figure", "figcaption", "img", "hr",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height"]),
};

/**
 * Sanitizador minimo para o corpo das materias. O editor do painel e usado
 * apenas por pessoas autenticadas, mas o HTML ainda passa por aqui antes de
 * ser gravado, para barrar script/iframe/handlers inline.
 */
export function sanitizeHtml(input: string): string {
  let html = input
    .replace(/<\s*(script|style|iframe|object|embed|form)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|form)[^>]*>/gi, "");

  html = html.replace(/<\/?([a-zA-Z0-9]+)((?:\s+[^>]*)?)>/g, (match, rawTag, rawAttrs) => {
    const tag = String(rawTag).toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (match.startsWith("</")) return `</${tag}>`;

    const allowed = ALLOWED_ATTRS[tag];
    if (!allowed) return `<${tag}>`;

    const attrs: string[] = [];
    const attrRe = /([a-zA-Z-]+)\s*=\s*"([^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = attrRe.exec(String(rawAttrs))) !== null) {
      const name = m[1].toLowerCase();
      const value = m[2];
      if (!allowed.has(name)) continue;
      if (/^\s*javascript:/i.test(value)) continue;
      attrs.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
    }
    if (tag === "a" && attrs.some((a) => a.startsWith("target="))) {
      attrs.push('rel="noopener noreferrer"');
    }
    return `<${tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}>`;
  });

  return html;
}
