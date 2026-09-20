import Link from "next/link";
import type { NavItem } from "@/components/SiteHeader";

type Props = {
  siteName: string;
  nav: NavItem[];
  contact: {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  social: {
    instagram?: string | null;
    facebook?: string | null;
    youtube?: string | null;
  };
  subscribeHref: string;
};

export function SiteFooter({ siteName, nav, contact, social, subscribeHref }: Props) {
  const socialLinks = [
    { label: "Instagram", href: social.instagram },
    { label: "Facebook", href: social.facebook },
    { label: "YouTube", href: social.youtube },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));

  return (
    <footer className="mt-auto bg-brand text-white">
      <div className="container-portal grid gap-10 py-14 md:grid-cols-3 md:py-16">
        <div>
          <p className="font-display text-2xl italic">{siteName}</p>
          <p className="mt-3 max-w-xs text-sm text-white/90">
            Eventos, mat&eacute;rias, im&oacute;veis e v&iacute;deos da regi&atilde;o, em um s&oacute;
            lugar.
          </p>
          {socialLinks.length ? (
            <ul className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="eyebrow rounded-full border border-white/50 px-4 py-2 transition-colors hover:bg-white hover:text-brand"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav aria-label="Navega&ccedil;&atilde;o do rodap&eacute;">
          <p className="eyebrow text-white/90">Navega&ccedil;&atilde;o</p>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/sobre" className="hover:underline">
                Sobre
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="eyebrow text-white/90">Contato</p>
          <ul className="mt-4 space-y-2 text-sm text-white/90">
            {contact.phone ? <li>{contact.phone}</li> : null}
            {contact.email ? (
              <li>
                <a href={"mailto:" + contact.email} className="hover:underline">
                  {contact.email}
                </a>
              </li>
            ) : null}
            {contact.address ? <li>{contact.address}</li> : null}
          </ul>

          <Link
            href={subscribeHref}
            className="eyebrow mt-6 inline-block rounded-full bg-white px-6 py-3 text-brand transition-colors hover:bg-white/90"
          >
            Assine agora
          </Link>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="container-portal flex flex-col gap-2 py-5 text-xs text-white/90 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteName}. Todos os direitos reservados.
          </p>
          <p>Desenvolvido por Herick Neumann para a ag&ecirc;ncia BSEC.</p>
        </div>
      </div>
    </footer>
  );
}
