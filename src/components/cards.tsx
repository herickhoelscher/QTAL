import Image from "next/image";
import Link from "@/components/LocalizedLink";
import { VideoThumb } from "@/components/VideoThumb";
import { CategoryBadge } from "@/components/ui";
import { formatCurrency, formatDateShort, timeAgo } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n/locales";

type CardCategory = { name: string; slug: string };

/**
 * Card do feed, no padrao editorial das referencias trazidas pelo cliente:
 * caixa branca sobre fundo claro, imagem sangrando no topo, titulo serifado em
 * italico acima das categorias e um rodape com tempo relativo, edicao e "ler
 * mais". As imagens mantem proporcoes diferentes de proposito — e o que da ao
 * grid masonry o ritmo de alturas variaveis.
 */
export async function ContentCard({
  href,
  title,
  excerpt,
  image,
  imageAlt,
  categories = [],
  categoryHrefPrefix,
  date,
  meta,
  edition,
  relative = true,
  aspect = "4/3",
  headingLevel = 3,
  priority = false,
}: {
  href: string;
  title: string;
  excerpt?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  categories?: CardCategory[];
  categoryHrefPrefix?: string;
  date?: Date | string | null;
  meta?: string;
  /** Edicao do Modo Revista a que o conteudo pertence, quando houver. */
  edition?: string | null;
  relative?: boolean;
  aspect?: string;
  /** Carrega a imagem sem lazy: use nos primeiros cards, que sao o LCP. */
  priority?: boolean;
  /** 2 nas listagens (o h1 e o titulo da pagina), 3 quando o card vem sob um
      titulo de secao — mantem a hierarquia de headings sem saltos. */
  headingLevel?: 2 | 3;
}) {
  const { locale, t } = await getDictionary();
  const Heading = ("h" + headingLevel) as "h2" | "h3";
  const [primary, ...secondary] = categories;

  return (
    <article className="group bg-surface shadow-[0_1px_3px_rgba(26,26,26,0.07),0_8px_24px_-18px_rgba(26,26,26,0.35)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_2px_6px_rgba(26,26,26,0.08),0_22px_48px_-24px_rgba(26,26,26,0.45)]">
      <Link href={href} className="block">
        <div
          className="relative w-full overflow-hidden bg-surface-alt"
          style={{ aspectRatio: aspect }}
        >
          {image ? (
            <Image
              src={image}
              alt={imageAlt ?? title}
              fill
              priority={priority}
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1440px) 48vw, 520px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : null}
        </div>
      </Link>

      <div className="p-5 md:p-6">
        <Heading className="font-display text-[1.45rem] leading-[1.2] font-bold italic md:text-[1.6rem]">
          <Link href={href} className="transition-colors hover:text-brand">
            {title}
          </Link>
        </Heading>

        {primary ? (
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <CategoryBadge
              name={primary.name}
              href={categoryHrefPrefix ? categoryHrefPrefix + primary.slug : undefined}
            />
            {secondary.length ? (
              <span className="eyebrow text-muted">
                {secondary.map((category) => category.name).join(", ")}
              </span>
            ) : null}
          </div>
        ) : null}

        {excerpt ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">{excerpt}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
          <span className="eyebrow text-muted">
            {date ? (relative ? timeAgo(date, locale) : formatDateShort(date, locale)) : null}
            {date && meta ? " · " : null}
            {meta}
          </span>
          {edition ? <span className="eyebrow text-accent-text">{edition}</span> : null}
          <Link href={href} className="eyebrow group/link text-brand hover:underline">
            {t.common.readMore}{" "}
            <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-0.5">
              &rsaquo;
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * Espaco publicitario do feed. A etiqueta "informe publicitario" acima do bloco
 * e o padrao das duas referencias — e o que separa publieditorial de conteudo
 * editorial aos olhos do leitor. Sem campanha cadastrada, o card mostra as
 * dimensoes do inventario, servindo de placeholder na apresentacao.
 */
export async function AdCard({
  image,
  href,
  label,
  advertiser,
}: {
  image?: string | null;
  href?: string;
  label?: string;
  advertiser?: string;
}) {
  const { t } = await getDictionary();
  const body = (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-alt">
      {image ? (
        <Image
          src={image}
          alt={advertiser ? fmt(t.cards.adOf, { name: advertiser }) : t.cards.adSpace}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1440px) 48vw, 520px"
          className="object-cover transition-transform duration-700 hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 border border-dashed border-line text-muted">
          <span className="eyebrow">{t.cards.adSpace}</span>
          <span className="text-xs">970×250 · 300×600 · 728×90</span>
        </div>
      )}
    </div>
  );

  return (
    <aside className="bg-surface p-3 shadow-[0_1px_3px_rgba(26,26,26,0.07),0_8px_24px_-18px_rgba(26,26,26,0.35)]">
      <p className="eyebrow mb-3 text-center text-muted">{label ?? t.cards.adLabel}</p>
      {href ? (
        <Link href={href} className="block">
          {body}
        </Link>
      ) : (
        body
      )}
      {advertiser ? (
        <p className="eyebrow mt-3 text-center text-muted">{advertiser}</p>
      ) : null}
    </aside>
  );
}

export async function VideoCard({
  href,
  title,
  embedId,
  customThumbnail,
  provider,
  eventTitle,
  feedHref,
  vertical = false,
  headingLevel = 3,
  priority = false,
}: {
  href: string;
  title: string;
  embedId: string;
  customThumbnail?: string | null;
  provider: string;
  /** Reels/Shorts: a capa entra em retrato no lugar do 16:9. */
  vertical?: boolean;
  eventTitle?: string | null;
  /** Abre este vídeo já dentro do feed vertical, quando informado. */
  feedHref?: string;
  headingLevel?: 2 | 3;
  priority?: boolean;
}) {
  const { t } = await getDictionary();
  const Heading = ("h" + headingLevel) as "h2" | "h3";
  // Clicar na capa abre o feed vertical (a experiencia de rolar de um video
  // para o outro); o titulo continua levando a pagina do video.
  const playHref = feedHref ?? href;

  return (
    <article className="group">
      <Link href={playHref} className="block" aria-label={fmt(t.cards.watch, { title })}>
        {/* 3/4 e nao 9:16: em tres colunas de 500px, um card 9:16 passaria de
            880px de altura e engoliria a grade inteira. */}
        <div
          className={
            "relative w-full overflow-hidden bg-ink " + (vertical ? "aspect-[3/4]" : "aspect-video")
          }
        >
          <VideoThumb
            embedId={embedId}
            custom={customThumbnail}
            alt={title}
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1440px) 45vw, 520px"
            className="object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.04] group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          {feedHref ? (
            <span className="eyebrow absolute right-3 bottom-3 bg-black/55 px-2.5 py-1 text-white backdrop-blur-sm">
              {t.cards.feed}
            </span>
          ) : null}
        </div>
      </Link>
      <div className="pt-3">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-muted">{provider}</p>
          <Link href={href} className="eyebrow text-brand hover:underline">
            {t.cards.seePage}
          </Link>
        </div>
        <Heading className="mt-1 font-display text-xl leading-[1.25] font-bold italic">
          <Link href={href} className="transition-colors hover:text-brand">
            {title}
          </Link>
        </Heading>
        {eventTitle ? (
          <p className="mt-1 text-xs text-muted">{fmt(t.cards.fromEvent, { title: eventTitle })}</p>
        ) : null}
      </div>
    </article>
  );
}

export async function PropertyCard({
  href,
  title,
  image,
  city,
  region,
  type,
  price,
  priceOnRequest,
  area,
  bedrooms,
  bathrooms,
  garageSpots,
  headingLevel = 3,
  priority = false,
}: {
  href: string;
  title: string;
  image?: string | null;
  city: string;
  region?: string | null;
  type: string;
  price?: number | string | null;
  priceOnRequest: boolean;
  area?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  garageSpots?: number | null;
  headingLevel?: 2 | 3;
  priority?: boolean;
}) {
  const { locale, t } = await getDictionary();
  const Heading = ("h" + headingLevel) as "h2" | "h3";
  const specs = [
    area ? area + " m²" : null,
    bedrooms ? fmt(bedrooms > 1 ? t.cards.bedrooms : t.cards.bedroom, { n: bedrooms }) : null,
    bathrooms ? fmt(bathrooms > 1 ? t.cards.bathrooms : t.cards.bathroom, { n: bathrooms }) : null,
    garageSpots ? fmt(garageSpots > 1 ? t.cards.spots : t.cards.spot, { n: garageSpots }) : null,
  ].filter(Boolean);
  // Aceita o codigo do banco (CASA) ou um rotulo pronto.
  const typeLabel = t.propertyTypes[type as keyof typeof t.propertyTypes] ?? type;

  return (
    <article className="group bg-surface shadow-[0_1px_3px_rgba(26,26,26,0.07),0_8px_24px_-18px_rgba(26,26,26,0.35)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_2px_6px_rgba(26,26,26,0.08),0_22px_48px_-24px_rgba(26,26,26,0.45)]">
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-alt">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              priority={priority}
              quality={85}
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
          <span className="eyebrow absolute top-3 left-3 bg-surface/95 px-3 py-1 text-ink">
            {typeLabel}
          </span>
        </div>
      </Link>

      <div className="p-5">
        <p className="eyebrow text-muted">{region ? city + " · " + region : city}</p>
        <Heading className="mt-2 font-display text-xl leading-snug font-bold italic">
          <Link href={href} className="transition-colors hover:text-brand">
            {title}
          </Link>
        </Heading>
        {specs.length ? (
          <p className="mt-3 text-sm text-muted">{specs.join(" · ")}</p>
        ) : null}
        <p className="mt-4 font-display text-xl text-brand">
          {priceOnRequest ? t.common.priceOnRequest : formatCurrency(price, locale)}
        </p>
      </div>
    </article>
  );
}
