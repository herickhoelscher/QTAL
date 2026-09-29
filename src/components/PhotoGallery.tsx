import Image from "next/image";

export type GalleryPhoto = {
  id: string;
  url: string;
  altText: string | null;
  featured: boolean;
};

/**
 * Galeria no padrao da referencia: a foto marcada como destaque no painel abre
 * em largura total e as demais seguem em grade de tres colunas, na ordem
 * cadastrada. Sem nenhuma marcada, a primeira da ordem abre grande.
 */
export function PhotoGallery({
  photos,
  fallbackAlt,
}: {
  photos: GalleryPhoto[];
  fallbackAlt: string;
}) {
  if (!photos.length) return null;

  const heroIndex = Math.max(
    0,
    photos.findIndex((photo) => photo.featured),
  );
  const hero = photos[heroIndex];
  const rest = photos.filter((_, index) => index !== heroIndex);

  return (
    <>
      <figure className="relative aspect-[16/10] w-full bg-surface-alt">
        <Image
          src={hero.url}
          alt={hero.altText ?? fallbackAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 900px"
          quality={85}
          className="object-cover"
        />
      </figure>

      {rest.length ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((photo) => (
            <figure key={photo.id} className="relative aspect-[4/3] bg-surface-alt">
              <Image
                src={photo.url}
                alt={photo.altText ?? fallbackAlt}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </figure>
          ))}
        </div>
      ) : null}
    </>
  );
}
