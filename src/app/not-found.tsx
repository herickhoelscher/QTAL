import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-alt px-6 py-20">
      <div className="max-w-lg text-center">
        <p className="eyebrow text-brand">Erro 404</p>
        <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
          Esta página não existe mais
        </h1>
        <p className="mt-4 text-muted">
          O endereço pode ter mudado ou o conteúdo saiu do ar. Os caminhos abaixo continuam
          valendo.
        </p>
        <nav className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {[
            { href: "/", label: "Início" },
            { href: "/materias", label: "Matérias" },
            { href: "/eventos", label: "Eventos" },
            { href: "/imoveis", label: "Imóveis" },
            { href: "/videos", label: "Vídeos" },
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
