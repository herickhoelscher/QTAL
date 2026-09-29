import { SiteHeader, type NavItem } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DataBar } from "@/components/DataBar";
import { UtilityBar } from "@/components/UtilityBar";
import { getSettings, whatsappLink } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  // As editorias sairam do menu: agora elas vivem como abas dentro de /materias,
  // onde o leitor filtra sem sair da pagina.
  const nav: NavItem[] = [
    { label: "Matérias", href: "/materias" },
    { label: "Eventos", href: "/eventos" },
    { label: "Imóveis", href: "/imoveis" },
    { label: "Vídeos", href: "/videos" },
    { label: "Assine", href: "/assine" },
    { label: "Sobre", href: "/sobre" },
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
            tagline={settings.siteDescription}
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
        subscribeHref={whatsappLink(settings.whatsappNumber, settings.whatsappMessage)}
      />
    </>
  );
}
