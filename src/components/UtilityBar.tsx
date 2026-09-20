import Link from "next/link";

/**
 * Barra utilitaria do topo (secao 3.2 da especificacao): faixa escura com redes
 * sociais e a assinatura da publicacao, acima do header. Fica escondida no
 * celular, onde cada pixel de altura conta e as redes ja aparecem no rodape.
 */
export function UtilityBar({
  tagline,
  social,
  phone,
}: {
  tagline: string;
  social: { instagram?: string | null; facebook?: string | null; youtube?: string | null };
  phone?: string | null;
}) {
  const links = [
    { href: social.instagram, label: "Instagram", path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .48 1.4.9.43.42.7.82.92 1.4.17.42.36 1.05.42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2a3.9 3.9 0 0 1-.92 1.4c-.42.43-.82.7-1.4.92-.42.17-1.05.36-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42a3.9 3.9 0 0 1-1.4-.92 3.9 3.9 0 0 1-.92-1.4c-.17-.42-.36-1.05-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.22-.6.48-1 .92-1.4.42-.43.82-.7 1.4-.92.42-.17 1.05-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2zm0 3.2a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2zm0 10.9a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6zm8.4-11.2a1.55 1.55 0 1 1-3.1 0 1.55 1.55 0 0 1 3.1 0z" },
    { href: social.facebook, label: "Facebook", path: "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.12-2.4-.12-2.38 0-4 1.45-4 4.12V9.9H7.6V13h2.7v8h3.2z" },
    { href: social.youtube, label: "YouTube", path: "M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.2 22 12 22 12s0-3.2-.4-4.8zM10 15.2V8.8l5.2 3.2-5.2 3.2z" },
  ].filter((item): item is { href: string; label: string; path: string } => Boolean(item.href));

  return (
    <div className="hidden bg-ink text-white md:block">
      <div className="container-portal flex h-9 items-center justify-between gap-6">
        <div className="flex items-center gap-1">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              className="flex h-7 w-7 items-center justify-center text-white/65 transition-colors hover:text-white"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
                <path d={item.path} />
              </svg>
            </a>
          ))}
        </div>

        <p className="eyebrow truncate text-white/55">{tagline}</p>

        <div className="flex items-center gap-5">
          {phone ? (
            <a href={"tel:" + phone.replace(/\D/g, "")} className="eyebrow text-white/65 hover:text-white">
              {phone}
            </a>
          ) : null}
          <Link href="/assine" className="eyebrow text-white/65 hover:text-white">
            Assine
          </Link>
        </div>
      </div>
    </div>
  );
}
