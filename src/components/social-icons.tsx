export type SocialUrls = {
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
};

/**
 * Os tres caminhos SVG das redes, em um lugar so: a barra utilitaria, o menu do
 * celular e o rodape desenham os mesmos icones.
 */
const PATHS = {
  Instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .48 1.4.9.43.42.7.82.92 1.4.17.42.36 1.05.42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2a3.9 3.9 0 0 1-.92 1.4c-.42.43-.82.7-1.4.92-.42.17-1.05.36-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42a3.9 3.9 0 0 1-1.4-.92 3.9 3.9 0 0 1-.92-1.4c-.17-.42-.36-1.05-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.22-.6.48-1 .92-1.4.42-.43.82-.7 1.4-.92.42-.17 1.05-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2zm0 3.2a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2zm0 10.9a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6zm8.4-11.2a1.55 1.55 0 1 1-3.1 0 1.55 1.55 0 0 1 3.1 0z",
  Facebook:
    "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.12-2.4-.12-2.38 0-4 1.45-4 4.12V9.9H7.6V13h2.7v8h3.2z",
  YouTube:
    "M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77C22 15.2 22 12 22 12s0-3.2-.4-4.8zM10 15.2V8.8l5.2 3.2-5.2 3.2z",
} as const;

export function socialList(social: SocialUrls) {
  return [
    { label: "Instagram" as const, href: social.instagram },
    { label: "Facebook" as const, href: social.facebook },
    { label: "YouTube" as const, href: social.youtube },
  ].filter((item): item is { label: keyof typeof PATHS; href: string } => Boolean(item.href));
}

export function SocialIcon({ label, size = 15 }: { label: keyof typeof PATHS; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d={PATHS[label]} />
    </svg>
  );
}

/**
 * Fileira de icones das redes. `variant` escolhe o acabamento:
 * "plain" para a barra escura do topo, "outline" para o rodape e o menu.
 */
export function SocialLinks({
  social,
  variant = "plain",
  size = 15,
  className = "",
}: {
  social: SocialUrls;
  variant?: "plain" | "outline";
  size?: number;
  className?: string;
}) {
  const links = socialList(social);
  if (!links.length) return null;

  const base =
    variant === "outline"
      ? "flex h-10 w-10 items-center justify-center border border-white/50 transition-colors hover:bg-white hover:text-brand"
      : "flex h-7 w-7 items-center justify-center text-white/65 transition-colors hover:text-white";

  return (
    <ul className={"flex items-center " + (variant === "outline" ? "gap-3 " : "gap-1 ") + className}>
      {links.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className={base}
          >
            <SocialIcon label={item.label} size={size} />
          </a>
        </li>
      ))}
    </ul>
  );
}
