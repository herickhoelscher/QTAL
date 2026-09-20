"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Capa do video com degrade de qualidade.
 *
 * O YouTube serve `maxresdefault` (1280x720) so para quem enviou o video em HD;
 * para os demais, aquele endereco responde 404 e a imagem quebraria. Como nao
 * da para descobrir isso no servidor sem uma requisicao extra por card, pedimos
 * a versao grande e caimos para `hqdefault` (480x360) no onError.
 *
 * Sem isso, todo card usaria 480px de origem — que era a causa das capas
 * borradas nas grades de 3 colunas.
 */
export function VideoThumb({
  embedId,
  custom,
  alt,
  sizes,
  className,
  priority = false,
}: {
  embedId: string;
  custom?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const best = custom ?? `https://i.ytimg.com/vi/${embedId}/maxresdefault.jpg`;
  const [src, setSrc] = useState(best);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      quality={85}
      sizes={sizes}
      className={className}
      onError={() => {
        if (!custom) setSrc(`https://i.ytimg.com/vi/${embedId}/hqdefault.jpg`);
      }}
    />
  );
}
