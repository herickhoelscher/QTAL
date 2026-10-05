import Link from "@/components/LocalizedLink";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { SocialLinks, type SocialUrls } from "@/components/social-icons";
import { getDictionary } from "@/lib/i18n/server";

/**
 * Barra utilitaria do topo (secao 3.2 da especificacao): faixa escura com redes
 * sociais, a assinatura da publicacao e as bandeiras de idioma, acima do
 * header. Fica escondida no celular, onde cada pixel de altura conta — la
 * idioma e redes aparecem dentro do menu, e as redes tambem no rodape.
 */
export async function UtilityBar({
  tagline,
  social,
  phone,
}: {
  tagline: string;
  social: SocialUrls;
  phone?: string | null;
}) {
  const { t } = await getDictionary();

  return (
    <div className="hidden bg-ink text-white md:block">
      <div className="container-portal flex h-9 items-center justify-between gap-6">
        <SocialLinks social={social} />

        <p className="eyebrow truncate text-white/55">{tagline}</p>

        <div className="flex items-center gap-5">
          {phone ? (
            <a href={"tel:" + phone.replace(/\D/g, "")} className="eyebrow text-white/65 hover:text-white">
              {phone}
            </a>
          ) : null}
          <Link href="/anuncie" className="eyebrow text-white/65 hover:text-white">
            {t.nav.subscribe}
          </Link>
          <span aria-hidden className="h-3 w-px bg-white/25" />
          <LocaleSwitcher />
        </div>
      </div>
    </div>
  );
}
