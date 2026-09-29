import Link from "next/link";
import { SocialLinks, type SocialUrls } from "@/components/social-icons";

/**
 * Barra utilitaria do topo (secao 3.2 da especificacao): faixa escura com redes
 * sociais e a assinatura da publicacao, acima do header. Fica escondida no
 * celular, onde cada pixel de altura conta — la as redes aparecem dentro do
 * menu e tambem no rodape.
 */
export function UtilityBar({
  tagline,
  social,
  phone,
}: {
  tagline: string;
  social: SocialUrls;
  phone?: string | null;
}) {
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
          <Link href="/assine" className="eyebrow text-white/65 hover:text-white">
            Assine
          </Link>
        </div>
      </div>
    </div>
  );
}
