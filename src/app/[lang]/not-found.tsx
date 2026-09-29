import Link from "@/components/LocalizedLink";
import { getDictionary } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getDictionary();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-alt px-6 py-20">
      <div className="max-w-lg text-center">
        <p className="eyebrow text-brand">{t.notFound.eyebrow}</p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">{t.notFound.title}</h1>
        <p className="mt-4 text-muted">{t.notFound.text}</p>
        <nav className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {[
            { href: "/", label: t.nav.home },
            { href: "/materias", label: t.nav.articles },
            { href: "/eventos", label: t.nav.events },
            { href: "/imoveis", label: t.nav.properties },
            { href: "/videos", label: t.nav.videos },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="eyebrow text-ink hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
