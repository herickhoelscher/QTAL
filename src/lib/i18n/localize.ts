import "server-only";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/server";
import { fieldsOf, type ContentModel } from "@/lib/i18n/content";
import { applyTranslations } from "@/lib/i18n/overlay";

export type LocalizeGroup = {
  model: ContentModel;
  records: ({ id: string } | null | undefined)[];
};

/**
 * Lado da leitura: troca, no proprio objeto, os campos dos registros pela
 * traducao do idioma da pagina. Em portugues nao faz nada; em ingles e
 * espanhol faz uma unica consulta para todos os grupos. O que nao tiver
 * traducao continua em portugues — nunca derruba a pagina.
 */
export async function localize(groups: LocalizeGroup[]): Promise<void> {
  const locale = await getLocale();
  if (locale === "pt") return;

  const clean = groups
    .map((group) => ({
      model: group.model,
      fields: fieldsOf(group.model),
      records: group.records.filter((record): record is { id: string } => Boolean(record?.id)),
    }))
    .filter((group) => group.records.length);
  if (!clean.length) return;

  try {
    const rows = await prisma.translation.findMany({
      where: {
        locale,
        OR: clean.map((group) => ({
          model: group.model,
          recordId: { in: [...new Set(group.records.map((record) => record.id))] },
          field: { in: group.fields },
        })),
      },
      select: { model: true, recordId: true, field: true, value: true },
    });
    for (const group of clean) applyTranslations(group.model, group.records, group.fields, rows);
  } catch (error) {
    console.error("[traducao] leitura:", error);
  }
}
