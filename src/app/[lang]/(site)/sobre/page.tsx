import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui";
import { getSettings } from "@/lib/settings";
import { fmt } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/server";
import { alternatesFor } from "@/lib/i18n/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return {
    title: t.about.title,
    description: t.about.metaDescription,
    alternates: await alternatesFor("/sobre"),
  };
}

export default async function AboutPage() {
  const [settings, { t }] = await Promise.all([getSettings(), getDictionary()]);

  return (
    <>
      <PageHeader eyebrow={t.about.eyebrow} title={t.about.title} />

      <Section className="max-w-3xl">
        <div className="prose-editorial">
          <p>{fmt(t.about.intro, { site: settings.siteName })}</p>
          <h2>{t.about.publicationTitle}</h2>
          <p>{t.about.publicationText}</p>
          <h2>{t.about.contactTitle}</h2>
          <ul>
            {settings.contactPhone ? (
              <li>
                {t.about.phone}: {settings.contactPhone}
              </li>
            ) : null}
            {settings.contactEmail ? (
              <li>
                {t.about.email}: {settings.contactEmail}
              </li>
            ) : null}
            {settings.contactAddress ? (
              <li>
                {t.about.address}: {settings.contactAddress}
              </li>
            ) : null}
          </ul>
        </div>

        <div className="mt-14 border-t border-line pt-8">
          <p className="eyebrow text-muted">{t.about.production}</p>
          <p className="mt-3 text-muted">{t.about.developedBy}</p>
        </div>
      </Section>
    </>
  );
}
