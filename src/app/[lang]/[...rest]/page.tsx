import { notFound } from "next/navigation";

/**
 * Endereco que nao bate com nenhuma pagina: cai no not-found do idioma, com
 * header, rodape e textos traduzidos, em vez da pagina 404 crua do Next.
 */
export default function CatchAll() {
  notFound();
}
