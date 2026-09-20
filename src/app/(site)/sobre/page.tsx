import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Quem faz o portal e como falar com a equipe.",
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader eyebrow="Institucional" title="Sobre" />

      <Section className="max-w-3xl">
        <div className="prose-editorial">
          <p>
            O {settings.siteName} reúne, em um só lugar, a cobertura de eventos, as matérias da
            redação, o mercado imobiliário e os vídeos produzidos pela equipe. A proposta é a de
            uma revista digital: leitura sequencial, imagem grande e curadoria.
          </p>
          <h2>A publicação</h2>
          <p>
            A redação publica matérias, cobre eventos da região e mantém uma vitrine de imóveis
            atualizada. A barra no topo do site traz clima, cotação do dólar e o CUB da construção
            civil, para consulta rápida sem sair da página.
          </p>
          <h2>Contato</h2>
          <ul>
            {settings.contactPhone ? <li>Telefone: {settings.contactPhone}</li> : null}
            {settings.contactEmail ? <li>E-mail: {settings.contactEmail}</li> : null}
            {settings.contactAddress ? <li>Endereço: {settings.contactAddress}</li> : null}
          </ul>
        </div>

        <div className="mt-14 border-t border-line pt-8">
          <p className="eyebrow text-muted">Produção digital</p>
          <p className="mt-3 text-muted">
            Projeto desenvolvido por Herick Neumann para a agência BSEC.
          </p>
        </div>
      </Section>
    </>
  );
}
