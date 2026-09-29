import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { lang } from "next/root-params";
import { I18nProvider } from "@/components/I18nProvider";
import { inter, playfair } from "@/lib/fonts";
import { LOCALES, LOCALE_TAG, OG_LOCALE, isLocale, toLocale } from "@/lib/i18n/locales";
import { getSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site-url";
import "../globals.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ lang: locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const [settings, locale] = await Promise.all([getSettings(), lang()]);
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: settings.siteName,
      template: `%s · ${settings.siteName}`,
    },
    description: settings.siteDescription,
    openGraph: {
      type: "website",
      locale: OG_LOCALE[toLocale(locale)],
      siteName: settings.siteName,
    },
  };
}

/**
 * Layout raiz do site publico. O [lang] vem do endereco: /en e /es direto, e o
 * portugues chega aqui como /pt pela reescrita do proxy (o leitor nunca ve o
 * /pt na barra de endereco).
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await lang();
  if (!isLocale(locale)) notFound();

  const settings = await getSettings();
  const gtmId = settings.gtmContainerId?.trim();

  return (
    <html
      lang={LOCALE_TAG[locale]}
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        {gtmId ? (
          <>
            {/* GTM carregado apos a hidratacao, sem bloquear o LCP. */}
            <Script id="gtm" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
                title="Google Tag Manager"
              />
            </noscript>
          </>
        ) : null}
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
