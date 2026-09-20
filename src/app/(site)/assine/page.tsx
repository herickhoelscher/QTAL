import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui";
import { getSettings, whatsappLink } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Assine",
  description: "Receba as edições e os destaques da região direto no WhatsApp.",
};

const BENEFITS = [
  {
    title: "Edições completas",
    description: "Cada nova edição chega para você antes de ir ao ar no site.",
  },
  {
    title: "Cobertura dos eventos",
    description: "Fotos e vídeos dos eventos da região, com os bastidores.",
  },
  {
    title: "Mercado imobiliário",
    description: "Lançamentos e oportunidades acompanhados do CUB atualizado.",
  },
];

export default async function SubscribePage() {
  const settings = await getSettings();
  const link = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);

  return (
    <>
      <PageHeader
        eyebrow="Assinatura"
        title="Assine a revista"
        description="O atendimento é feito por uma pessoa da equipe, pelo WhatsApp comercial."
      />

      <Section className="max-w-4xl">
        <div className="grid gap-10 md:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title}>
              <h2 className="font-display text-xl">{benefit.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 border border-line bg-surface-alt p-8 text-center md:p-12">
          <h2 className="font-display text-3xl leading-tight md:text-4xl">
            Comece sua assinatura agora
          </h2>
          <p className="mt-3 text-muted">
            Você fala direto com a equipe e confirma os detalhes em poucos minutos.
          </p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow mt-8 inline-block rounded-full bg-brand px-10 py-4 text-white transition-colors hover:bg-brand-dark"
          >
            Assine agora
          </a>
        </div>
      </Section>
    </>
  );
}
