"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "@/components/I18nProvider";

type Props = ComponentProps<typeof NextLink>;

/**
 * next/link que mantem o leitor no idioma em que ele esta: "/materias" vira
 * "/en/materias" numa pagina em ingles. Os arquivos do site importam este
 * componente no lugar de next/link — um Link comum devolveria o leitor ao
 * portugues sem aviso.
 */
export default function Link({ href, ...props }: Props) {
  const { href: localize } = useI18n();
  const target = typeof href === "string" ? localize(href) : href;
  return <NextLink href={target} {...props} />;
}
