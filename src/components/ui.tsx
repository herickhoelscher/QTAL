import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

/** Badge de categoria reutilizado em todo o site (secao 4.4). */
export function CategoryBadge({
  name,
  href,
  tone = "accent",
}: {
  name: string;
  href?: string;
  tone?: "accent" | "brand" | "light";
}) {
  const tones = {
    accent: "text-accent-text",
    brand: "text-brand",
    light: "text-white/80",
  };
  const content = <span className={"eyebrow " + tones[tone]}>{name}</span>;
  return href ? (
    <Link href={href} className="hover:underline">
      {content}
    </Link>
  ) : (
    content
  );
}

export function SectionHeading({
  title,
  href,
  linkLabel = "Ver todos",
  eyebrow,
  description,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  eyebrow?: string;
  description?: string;
}) {
  return (
    <Reveal className="mb-8 border-b border-line pb-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow ? <p className="eyebrow mb-2 text-accent-text">{eyebrow}</p> : null}
          <h2 className="font-display text-3xl leading-none md:text-4xl">{title}</h2>
        </div>
        {href ? (
          <Link
            href={href}
            className="eyebrow group shrink-0 text-brand hover:underline"
          >
            {linkLabel}{" "}
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        ) : null}
      </div>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="border-b border-line bg-surface-alt">
      <div className="container-portal py-14 md:py-20">
        {eyebrow ? <p className="eyebrow text-brand">{eyebrow}</p> : null}
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-6xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base text-muted md:text-lg">{description}</p>
        ) : null}
      </div>
    </header>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line px-6 py-16 text-center text-muted">
      {children}
    </div>
  );
}

export function Section({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  /** Abre o container ate 1680px para caber a terceira coluna do feed. */
  wide?: boolean;
}) {
  return (
    <section
      className={(wide ? "container-wide" : "container-portal") + " py-12 md:py-20 " + className}
    >
      {children}
    </section>
  );
}
