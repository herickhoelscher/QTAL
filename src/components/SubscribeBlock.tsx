import { getDictionary } from "@/lib/i18n/server";

/**
 * Bloco de assinatura (secao 6.8). No MVP o CTA abre o WhatsApp comercial com
 * a mensagem definida no painel. A estrutura fica pronta para, no futuro,
 * trocar o botao por um formulario/checkout sem redesenhar a secao.
 */
export async function SubscribeBlock({
  href,
  heading,
  description,
  buttonLabel,
}: {
  href: string;
  heading?: string;
  description?: string;
  buttonLabel?: string;
}) {
  const { t } = await getDictionary();
  return (
    <section className="bg-surface-alt">
      <div className="container-portal flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <div className="max-w-xl">
          <p className="eyebrow text-brand">{t.subscribeBlock.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl leading-tight md:text-5xl">{heading ?? t.subscribeBlock.heading}</h2>
          <p className="mt-4 text-muted">{description ?? t.subscribeBlock.description}</p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow shrink-0 rounded-full bg-brand px-8 py-4 text-white transition-colors hover:bg-brand-dark"
        >
          {buttonLabel ?? t.footer.subscribeNow}
        </a>
      </div>
    </section>
  );
}
