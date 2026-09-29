import Link from "@/components/LocalizedLink";
import type { NavItem } from "@/components/SiteHeader";
import { SocialLinks, socialList, type SocialUrls } from "@/components/social-icons";
import { getDictionary } from "@/lib/i18n/server";

type Props = {
  siteName: string;
  nav: NavItem[];
  contact: {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  social: SocialUrls;
  subscribeHref: string;
};

export async function SiteFooter({ siteName, nav, contact, social, subscribeHref }: Props) {
  const { t } = await getDictionary();
  const hasSocial = socialList(social).length > 0;

  return (
    <footer className="mt-auto bg-brand text-white">
      <div className="container-portal grid gap-10 py-14 md:grid-cols-3 md:py-16">
        <div>
          <p className="font-display text-2xl italic">{siteName}</p>
          <p className="mt-3 max-w-xs text-sm text-white/90">{t.footer.tagline}</p>
          {hasSocial ? (
            <div className="mt-8">
              <p className="eyebrow text-white/90">{t.header.socialMedia}</p>
              <SocialLinks social={social} variant="outline" size={18} className="mt-4" />
            </div>
          ) : null}
        </div>

        <nav aria-label={t.footer.navigationLabel}>
          <p className="eyebrow text-white/90">{t.footer.navigation}</p>
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
                {t.nav.about}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="eyebrow text-white/90">{t.footer.contact}</p>
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
            {t.footer.subscribeNow}
          </Link>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="container-portal flex flex-col gap-2 py-5 text-xs text-white/90 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteName}. {t.footer.rights}
          </p>
          <p>{t.footer.developedBy}</p>
        </div>
      </div>
    </footer>
  );
}
