import Image from "next/image";
import { mastheadSize, type CoverText } from "@/lib/issue-cover";

/**
 * Texto da capa sobre a foto: nome da revista no topo, titulo e subtitulo
 * embaixo. Ocupa o elemento pai inteiro (que precisa ser `relative`); as
 * letras acompanham a largura da capa, da miniatura a tela cheia.
 */
export function CoverOverlay({ text }: { text: CoverText }) {
  return (
    <span className="issue-cover">
      <span className="issue-cover__masthead" style={{ fontSize: mastheadSize(text.masthead) + "cqw" }}>
        {text.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={text.logoUrl} alt={text.masthead} />
        ) : (
          text.masthead
        )}
      </span>
      <span>
        <span className="issue-cover__title">{text.title}</span>
        {text.subtitle ? <span className="issue-cover__subtitle">{text.subtitle}</span> : null}
      </span>
    </span>
  );
}

/** Capa de uma edicao em miniatura: a foto e, quando ha titulo de capa, o texto por cima. */
export function IssueCoverArt({
  image,
  text,
  sizes,
  className = "",
}: {
  image: string | null;
  text: CoverText | null;
  sizes: string;
  className?: string;
}) {
  return (
    <span className={"relative block aspect-[3/4] overflow-hidden bg-[#1b1d22] " + className}>
      {image ? <Image src={image} alt="" fill sizes={sizes} className="object-cover" /> : null}
      {text ? <CoverOverlay text={text} /> : null}
    </span>
  );
}
