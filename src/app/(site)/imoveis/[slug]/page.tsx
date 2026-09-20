import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ShareButtons } from "@/components/ShareButtons";
import { VideoCard } from "@/components/cards";
import { Section } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { excerpt, formatCurrency } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitize";
import { getSettings, whatsappLink } from "@/lib/settings";
import { providerLabel } from "@/lib/video";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

const TYPE_LABELS: Record<string, string> = {
  CASA: "Casa",
  APARTAMENTO: "Apartamento",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
  RURAL: "Rural",
};

async function getProperty(slug: string) {
  return prisma.property.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      gallery: { orderBy: { position: "asc" } },
      videos: { where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return {};
  const description = property.description ? excerpt(property.description) : undefined;
  return {
    title: property.title,
    description,
    alternates: { canonical: "/imoveis/" + property.slug },
    openGraph: {
      title: property.title,
      description,
      images: property.coverImage ? [{ url: property.coverImage }] : undefined,
    },
  };
}

export default async function PropertyPage({ params }: Params) {
  const { slug } = await params;
  const [property, settings] = await Promise.all([getProperty(slug), getSettings()]);
  if (!property) notFound();

  const specs = [
    { label: "Tipo", value: TYPE_LABELS[property.type] ?? property.type },
    { label: "Área", value: property.area ? property.area + " m²" : null },
    { label: "Quartos", value: property.bedrooms },
    { label: "Banheiros", value: property.bathrooms },
    { label: "Vagas", value: property.garageSpots },
    { label: "Cidade", value: property.city },
    { label: "Região", value: property.region },
  ].filter((spec) => spec.value !== null && spec.value !== undefined && spec.value !== "");

  const contactLink = whatsappLink(
    settings.whatsappNumber,
    "Ola! Tenho interesse no imovel: " + property.title,
  );

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <div className="container-portal py-12 md:py-16">
          <p className="eyebrow text-brand">
            {TYPE_LABELS[property.type] ?? property.type} &middot; {property.city}
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl leading-tight md:text-5xl">
            {property.title}
          </h1>
          <p className="mt-5 font-display text-3xl text-brand">
            {property.priceOnRequest ? "Sob consulta" : formatCurrency(property.price?.toString())}
          </p>
        </div>
      </header>

      {property.coverImage ? (
        <figure className="relative aspect-[16/9] w-full bg-surface-alt">
          <Image
            src={property.coverImage}
            alt={property.coverAlt ?? property.title}
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover"
          />
        </figure>
      ) : null}

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-surface p-4">
                  <dt className="eyebrow text-muted">{spec.label}</dt>
                  <dd className="mt-1 text-lg">{spec.value}</dd>
                </div>
              ))}
            </dl>

            {property.description ? (
              <div
                className="prose-editorial mt-10"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(property.description) }}
              />
            ) : null}

            {property.gallery.length ? (
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {property.gallery.map((media) => (
                  <figure key={media.id} className="relative aspect-[4/3] bg-surface-alt">
                    <Image
                      src={media.url}
                      alt={media.altText ?? property.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover"
                    />
                  </figure>
                ))}
              </div>
            ) : null}

            {/* Video do imovel: visita guiada e tour, sem sair do site. */}
            {property.videos.length ? (
              <div className="mt-10">
                <h2 className="eyebrow mb-4 text-muted">
                  {property.videos.length > 1 ? "Vídeos do imóvel" : "Vídeo do imóvel"}
                </h2>
                <div className="grid items-start gap-6 sm:grid-cols-2">
                  {property.videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      href={"/videos/" + video.slug}
                      feedHref={"/videos/feed?v=" + video.slug}
                      title={video.title}
                      embedId={video.embedId}
                      customThumbnail={video.customThumbnail}
                      vertical={video.vertical}
                      provider={providerLabel(video.provider)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {property.tourUrl ? (
              <p className="mt-8">
                <a
                  href={property.tourUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eyebrow border-b border-brand pb-1 text-brand"
                >
                  Ver tour virtual &rarr;
                </a>
              </p>
            ) : null}

            {property.mapEmbedUrl ? (
              <div className="mt-10 aspect-[16/9] w-full overflow-hidden border border-line">
                <iframe
                  src={property.mapEmbedUrl}
                  title={"Mapa: " + property.title}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                />
              </div>
            ) : null}
          </div>

          <aside className="h-fit border border-line bg-surface-alt p-6 lg:sticky lg:top-40">
            <p className="eyebrow text-muted">Interessado?</p>
            <p className="mt-2 font-display text-2xl leading-snug">
              Fale com a equipe pelo WhatsApp
            </p>
            {property.address ? (
              <p className="mt-3 text-sm text-muted">{property.address}</p>
            ) : null}
            <a
              href={contactLink}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow mt-6 block rounded-full bg-brand px-6 py-3 text-center text-white transition-colors hover:bg-brand-dark"
            >
              Falar sobre este imóvel
            </a>
            <div className="mt-6 border-t border-line pt-4">
              <ShareButtons title={property.title} path={"/imoveis/" + property.slug} />
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
