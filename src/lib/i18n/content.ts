import "server-only";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { TARGET_LOCALES } from "@/lib/i18n/locales";
import { hashText } from "@/lib/i18n/overlay";
import {
  TranslatorQuotaError,
  deeplTranslator,
  myMemoryTranslator,
  type Translator,
} from "@/lib/i18n/translator";

/**
 * Lado da escrita das traducoes: roda no painel, ao publicar. O lado da
 * leitura (paginas publicas) fica em localize.ts.
 */

export type ContentModel =
  | "article"
  | "event"
  | "property"
  | "video"
  | "issue"
  | "category"
  | "settings";

type FieldSpec = { field: string; html: boolean };

/** Campos traduzidos de cada modelo. html: o texto vem do editor rico, com tags. */
export const TRANSLATABLE: Record<ContentModel, FieldSpec[]> = {
  article: [
    { field: "title", html: false },
    { field: "subtitle", html: false },
    { field: "body", html: true },
    { field: "metaTitle", html: false },
    { field: "metaDescription", html: false },
    { field: "coverAlt", html: false },
  ],
  event: [
    { field: "title", html: false },
    { field: "description", html: true },
    { field: "coverAlt", html: false },
  ],
  property: [
    { field: "title", html: false },
    { field: "description", html: true },
    { field: "coverAlt", html: false },
  ],
  video: [
    { field: "title", html: false },
    { field: "description", html: false },
  ],
  issue: [
    { field: "title", html: false },
    { field: "description", html: false },
  ],
  category: [{ field: "name", html: false }],
  // Textos digitados em Configuracoes: a frase da faixa do topo e a mensagem
  // que ja vem escrita no WhatsApp do "Assine".
  settings: [
    { field: "siteDescription", html: false },
    { field: "whatsappMessage", html: false },
  ],
};

export function fieldsOf(model: ContentModel): string[] {
  return TRANSLATABLE[model].map((spec) => spec.field);
}

type SourceRecord = { id: string } & Record<string, unknown>;

/** Busca os registros publicados (categorias nao tem status) com os campos traduziveis. */
async function loadSources(model: ContentModel, ids?: string[]): Promise<SourceRecord[]> {
  // O select e montado a partir de TRANSLATABLE, entao o Prisma nao consegue
  // inferir o formato: o resultado e tratado como registro generico.
  const select = Object.fromEntries([["id", true], ...fieldsOf(model).map((f) => [f, true])]);
  const rows = await loadRows(model, select, ids);
  return rows as unknown as SourceRecord[];
}

function loadRows(model: ContentModel, select: Record<string, boolean>, ids?: string[]) {
  const byId = ids ? { id: { in: ids } } : {};
  const published = { ...byId, status: "PUBLISHED" as const };
  switch (model) {
    case "article":
      return prisma.article.findMany({ where: published, select });
    case "event":
      return prisma.event.findMany({ where: published, select });
    case "property":
      return prisma.property.findMany({ where: published, select });
    case "video":
      return prisma.video.findMany({ where: published, select });
    case "issue":
      return prisma.issue.findMany({ where: published, select });
    case "category":
      return prisma.category.findMany({ where: byId, select });
    case "settings":
      return prisma.apiSettings.findMany({ where: byId, select });
  }
}

/**
 * DeepL quando ha chave (melhor qualidade, 500 mil caracteres/mes); sem ela,
 * o MyMemory, que dispensa cadastro — assim todo conteudo novo sai traduzido
 * mesmo antes de o cliente criar a conta no DeepL.
 */
async function getTranslator(): Promise<Translator> {
  const settings = await getSettings();
  const key = settings.deeplApiKey?.trim() || process.env.DEEPL_API_KEY?.trim();
  return key ? deeplTranslator(key) : myMemoryTranslator(settings.contactEmail);
}

type Job = { recordId: string; field: string; html: boolean; text: string; hash: string };

/** Campos de um lote de registros cuja traducao falta ou esta velha, por idioma. */
async function pendingJobs(model: ContentModel, records: SourceRecord[]) {
  const existing = await prisma.translation.findMany({
    where: { model, recordId: { in: records.map((r) => r.id) } },
    select: { locale: true, recordId: true, field: true, sourceHash: true },
  });
  const hashes = new Map(
    existing.map((row) => [row.locale + "|" + row.recordId + "|" + row.field, row.sourceHash]),
  );

  return TARGET_LOCALES.map((locale) => {
    const jobs: Job[] = [];
    for (const record of records) {
      for (const spec of TRANSLATABLE[model]) {
        const text = record[spec.field];
        if (typeof text !== "string" || !text.trim()) continue;
        const hash = hashText(text);
        if (hashes.get(locale + "|" + record.id + "|" + spec.field) === hash) continue;
        jobs.push({ recordId: record.id, field: spec.field, html: spec.html, text, hash });
      }
    }
    return { locale, jobs };
  });
}

async function runJobs(model: ContentModel, records: SourceRecord[], translator: Translator) {
  let fields = 0;
  for (const { locale, jobs } of await pendingJobs(model, records)) {
    // HTML e texto simples vao em chamadas separadas: tag_handling em texto
    // simples trocaria "&" por "&amp;" nos titulos.
    for (const html of [false, true]) {
      const group = jobs.filter((job) => job.html === html);
      if (!group.length) continue;
      const translated = await translator.translate(
        group.map((job) => job.text),
        locale,
        { html },
      );
      await prisma.$transaction(
        group.map((job, index) =>
          prisma.translation.upsert({
            where: {
              locale_model_recordId_field: {
                locale,
                model,
                recordId: job.recordId,
                field: job.field,
              },
            },
            create: {
              locale,
              model,
              recordId: job.recordId,
              field: job.field,
              value: translated[index] ?? "",
              sourceHash: job.hash,
            },
            update: { value: translated[index] ?? "", sourceHash: job.hash },
          }),
        ),
      );
      fields += group.length;
    }
  }
  return fields;
}

/**
 * Traduz um registro recem-salvo. Nunca lanca: sem chave, com cota estourada
 * ou com o DeepL fora do ar, o salvamento no painel conclui normalmente e o
 * leitor ve o portugues ate a proxima tentativa.
 */
export async function translateRecord(model: ContentModel, id: string): Promise<void> {
  try {
    const translator = await getTranslator();
    const records = await loadSources(model, [id]);
    if (records.length) await runJobs(model, records, translator);
  } catch (error) {
    console.error("[traducao] " + model + " " + id + ":", error);
  }
}

/** Apaga as traducoes de um registro excluido. */
export async function deleteTranslations(model: ContentModel, id: string): Promise<void> {
  await prisma.translation.deleteMany({ where: { model, recordId: id } });
}

const MODELS: ContentModel[] = [
  "settings",
  "category",
  "issue",
  "article",
  "event",
  "property",
  "video",
];

export type BackfillResult =
  | { ok: false; error: string }
  | { ok: true; translatedFields: number; remainingRecords: number };

/**
 * Botao "Traduzir acervo": percorre o conteudo publicado e traduz o que falta,
 * com teto de registros por clique para nao estourar o tempo da requisicao nem
 * a cota do mes de uma vez. Devolve quanto ainda falta.
 */
export async function translateBacklog(maxRecords = 20): Promise<BackfillResult> {
  const translator = await getTranslator();

  let translatedFields = 0;
  let budget = maxRecords;
  let remainingRecords = 0;

  try {
    for (const model of MODELS) {
      const records = await loadSources(model);
      const pending = await pendingJobs(model, records);
      const ids = new Set(pending.flatMap((entry) => entry.jobs.map((job) => job.recordId)));
      const todo = records.filter((record) => ids.has(record.id));

      const now = todo.slice(0, Math.max(0, budget));
      remainingRecords += todo.length - now.length;
      budget -= now.length;
      if (now.length) translatedFields += await runJobs(model, now, translator);
    }
  } catch (error) {
    console.error("[traducao] acervo:", error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: error instanceof TranslatorQuotaError
        ? "A cota diária da tradução gratuita acabou. O restante será traduzido amanhã — ou cadastre a chave do DeepL, que tem cota bem maior."
        : message.includes("456")
        ? "A cota mensal do DeepL acabou. O restante será traduzido quando ela renovar."
        : message.includes("403")
          ? "O DeepL recusou a chave. Confira se ela foi copiada inteira."
          : "O DeepL não respondeu. Tente de novo em alguns minutos.",
    };
  }

  return { ok: true, translatedFields, remainingRecords };
}
