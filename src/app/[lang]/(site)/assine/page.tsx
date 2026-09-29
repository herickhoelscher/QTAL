import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui";
import { getSettings, whatsappLink } from "@/lib/settings";
import { getDictionary } from "@/lib/i18n/server";
import { alternatesFor } from "@/lib/i18n/seo";
import { localizedSettingsTexts } from "@/lib/i18n/localize";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.subscribe.metaTitle,
    description: t.subscribe.metaDescription,
    alternates: await alternatesFor("/assine"),
  };
}

export default async function SubscribePage() {
  const [settings, { t }] = await Promise.all([getSettings(), getDictionary()]);
  const texts = await localizedSettingsTexts(settings);
  const link = whatsappLink(settings.whatsappNumber, texts.whatsappMessage);
  const benefits = [
    { title: t.subscribe.benefit1Title, description: t.subscribe.benefit1Text },
    { title: t.subscribe.benefit2Title, description: t.subscribe.benefit2Text },
    { title: t.subscribe.benefit3Title, description: t.subscribe.benefit3Text },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t.subscribe.eyebrow}
        title={t.subscribe.title}
        description={t.subscribe.description}
      />

      <Section className="max-w-4xl">
        <div className="grid gap-10 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title}>
              <h2 className="font-display text-xl">{benefit.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 border border-line bg-surface-alt p-8 text-center md:p-12">
          <h2 className="font-display text-3xl leading-tight md:text-4xl">
            {t.subscribe.ctaTitle}
          </h2>
          <p className="mt-3 text-muted">
            {t.subscribe.ctaText}
          </p>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow mt-8 inline-block rounded-full bg-brand px-10 py-4 text-white transition-colors hover:bg-brand-dark"
          >
            {t.footer.subscribeNow}
          </a>
        </div>
      </Section>
    </>
  );
}
