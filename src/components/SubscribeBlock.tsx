/**
 * Bloco de assinatura (secao 6.8). No MVP o CTA abre o WhatsApp comercial com
 * a mensagem definida no painel. A estrutura fica pronta para, no futuro,
 * trocar o botao por um formulario/checkout sem redesenhar a secao.
 */
export function SubscribeBlock({
  href,
  heading = "Receba cada edição antes de todo mundo",
  description = "Assinantes recebem as matérias, os eventos e os lançamentos imobiliários da região direto no WhatsApp.",
  buttonLabel = "Assine agora",
}: {
  href: string;
  heading?: string;
  description?: string;
  buttonLabel?: string;
}) {
  return (
    <section className="bg-surface-alt">
      <div className="container-portal flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <div className="max-w-xl">
          <p className="eyebrow text-brand">Assinatura</p>
          <h2 className="mt-3 font-display text-3xl leading-tight md:text-5xl">{heading}</h2>
          <p className="mt-4 text-muted">{description}</p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow shrink-0 rounded-full bg-brand px-8 py-4 text-white transition-colors hover:bg-brand-dark"
        >
          {buttonLabel}
        </a>
      </div>
    </section>
  );
}
