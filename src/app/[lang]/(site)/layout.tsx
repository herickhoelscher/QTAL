import { SiteHeader, type NavItem } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DataBar } from "@/components/DataBar";
import { UtilityBar } from "@/components/UtilityBar";
import { getSettings, whatsappLink } from "@/lib/settings";
import { getDictionary } from "@/lib/i18n/server";
import { localizedSettingsTexts } from "@/lib/i18n/localize";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, { t }] = await Promise.all([getSettings(), getDictionary()]);

  const texts = await localizedSettingsTexts(settings);

  // As editorias sairam do menu: agora elas vivem como abas dentro de /materias,
  // onde o leitor filtra sem sair da pagina.
  const nav: NavItem[] = [
    { label: t.nav.articles, href: "/materias" },
    { label: t.nav.events, href: "/eventos" },
    { label: t.nav.properties, href: "/imoveis" },
    { label: t.nav.videos, href: "/videos" },
    { label: t.nav.subscribe, href: "/assine" },
    { label: t.nav.about, href: "/sobre" },
  ];

  return (
    <>
      <SiteHeader
        siteName={settings.siteName}
        logoUrl={settings.clientLogoUrl}
        nav={nav}
        subscribeHref="/assine"
        social={{
          instagram: settings.instagramUrl,
          facebook: settings.facebookUrl,
          youtube: settings.youtubeUrl,
        }}
        dataBar={<DataBar />}
        utilityBar={
          <UtilityBar
            tagline={texts.siteDescription}
            social={{
              instagram: settings.instagramUrl,
              facebook: settings.facebookUrl,
              youtube: settings.youtubeUrl,
            }}
            phone={settings.contactPhone}
          />
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter
        siteName={settings.siteName}
        nav={nav.slice(0, 4)}
        contact={{
          phone: settings.contactPhone,
          email: settings.contactEmail,
          address: settings.contactAddress,
        }}
        social={{
          instagram: settings.instagramUrl,
          facebook: settings.facebookUrl,
          youtube: settings.youtubeUrl,
        }}
        subscribeHref={whatsappLink(settings.whatsappNumber, texts.whatsappMessage)}
      />
    </>
  );
}
