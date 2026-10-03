import Link from "next/link";
import { addHeroSlide, removeHeroSlide, reorderHeroSlide } from "@/app/admin/actions/featured";
import { CONTROL, PRIMARY_BUTTON } from "@/components/admin/styles";
import { AdminEmpty, AdminHeading, AdminTable, Card, Cell, Pill, Row } from "@/components/admin/ui";
import { HERO_LIMIT } from "@/lib/featured";
import { heroItem, loadHeroSlides, type HeroType } from "@/lib/hero";
import { prisma } from "@/lib/prisma";

const BASE = "/admin/carrossel";

const TYPE_LABEL: Record<HeroType, string> = {
  article: "Matéria",
  event: "Evento",
  property: "Imóvel",
  video: "Vídeo",
  issue: "Edição",
};

const ADMIN_PATH: Record<HeroType, string> = {
  article: "/admin/materias/",
  event: "/admin/eventos/",
  property: "/admin/imoveis/",
  video: "/admin/videos/",
  issue: "/admin/edicoes/",
};

const NOTICES: Record<string, string> = {
  "carrossel-cheio": `O carrossel já tem ${HERO_LIMIT} slides. Remova um antes de adicionar outro.`,
  "ja-no-carrossel": "Esse conteúdo já está no carrossel.",
};

/** Busca por titulo nos cinco tipos, para o "Adicionar". */
async function search(q: string) {
  const where = { title: { contains: q, mode: "insensitive" as const } };
  const select = { id: true, title: true, status: true } as const;
  const take = 5;
  const orderBy = { updatedAt: "desc" as const };
  const [article, event, property, video, issue] = await Promise.all([
    prisma.article.findMany({ where, select, take, orderBy }),
    prisma.event.findMany({ where, select, take, orderBy }),
    prisma.property.findMany({ where, select, take, orderBy }),
    prisma.video.findMany({ where, select, take, orderBy }),
    prisma.issue.findMany({ where, select, take, orderBy }),
  ]);
  const tag =
    (type: HeroType) =>
    (row: { id: string; title: string; status: string }) => ({ ...row, type });
  return [
    ...article.map(tag("article")),
    ...event.map(tag("event")),
    ...property.map(tag("property")),
    ...video.map(tag("video")),
    ...issue.map(tag("issue")),
  ];
}

function SlideButton({
  action,
  id,
  dir,
  label,
  disabled,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  dir?: "up" | "down";
  label: string;
  disabled?: boolean;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {dir ? <input type="hidden" name="dir" value={dir} /> : null}
      <input type="hidden" name="back" value={BASE} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={label}
        className={
          dir
            ? "flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:border-ink disabled:opacity-30"
            : "ml-2 text-sm font-semibold text-danger hover:underline"
        }
      >
        {dir ? (dir === "up" ? "↑" : "↓") : label}
      </button>
    </form>
  );
}

export default async function AdminHeroPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; aviso?: string }>;
}) {
  const { q = "", aviso } = await searchParams;
  const term = q.trim();

  const [rows, results] = await Promise.all([loadHeroSlides(), term ? search(term) : null]);
  const slides = rows.map(heroItem).filter((item) => item !== null);
  const inHero = new Set(slides.map((slide) => slide.type + ":" + slide.id));
  const full = slides.length >= HERO_LIMIT;

  return (
    <>
      <AdminHeading
        title="Carrossel"
        description={`O que aparece no topo da home, nesta ordem. Até ${HERO_LIMIT} slides, de qualquer seção.`}
      />

      {aviso && NOTICES[aviso] ? (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {NOTICES[aviso]}
        </p>
      ) : null}

      {slides.length ? (
        <AdminTable headers={["Ordem", "Slide", "Tipo", "Situação", ""]}>
          {slides.map((slide, index) => (
            <Row key={slide.slideId}>
              <Cell strong>{index + 1}</Cell>
              <Cell strong>
                <span className="flex items-center gap-3">
                  {slide.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={slide.image}
                      alt=""
                      className="h-12 w-20 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="h-12 w-20 shrink-0 rounded-lg bg-surface-alt" />
                  )}
                  <Link href={ADMIN_PATH[slide.type] + slide.id} className="hover:underline">
                    {slide.title}
                  </Link>
                </span>
              </Cell>
              <Cell>{TYPE_LABEL[slide.type]}</Cell>
              <Cell>
                {slide.status === "PUBLISHED" ? (
                  <Pill>No ar</Pill>
                ) : (
                  <span className="text-xs font-semibold text-danger">
                    Rascunho — não aparece no site
                  </span>
                )}
              </Cell>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <SlideButton
                    action={reorderHeroSlide}
                    id={slide.slideId}
                    dir="up"
                    label="Subir"
                    disabled={index === 0}
                  />
                  <SlideButton
                    action={reorderHeroSlide}
                    id={slide.slideId}
                    dir="down"
                    label="Descer"
                    disabled={index === slides.length - 1}
                  />
                  <SlideButton action={removeHeroSlide} id={slide.slideId} label="Remover" />
                </div>
              </td>
            </Row>
          ))}
        </AdminTable>
      ) : (
        <AdminEmpty>
          O carrossel está vazio. Enquanto isso, a home mostra as 3 matérias mais recentes. Use a
          busca abaixo para escolher os slides.
        </AdminEmpty>
      )}

      <Card className="mt-8 p-5 md:p-6">
        <h2 className="text-base font-bold text-ink">Adicionar ao carrossel</h2>
        <p className="mt-0.5 text-sm text-muted">
          Busque pelo título em matérias, eventos, imóveis, vídeos e edições.
        </p>
        <form method="get" className="mt-4 flex gap-3" role="search">
          <label htmlFor="busca-carrossel" className="sr-only">
            Buscar conteúdo
          </label>
          <input
            id="busca-carrossel"
            name="q"
            type="search"
            defaultValue={term}
            placeholder="Buscar por título"
            className={CONTROL}
          />
          <button type="submit" className={PRIMARY_BUTTON + " px-5"}>
            Buscar
          </button>
        </form>

        {results ? (
          results.length ? (
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
              {results.map((result) => {
                const already = inHero.has(result.type + ":" + result.id);
                return (
                  <li
                    key={result.type + result.id}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <span className="min-w-0 text-sm">
                      <span className="font-semibold text-ink">{result.title}</span>
                      <span className="ml-2 text-xs text-muted">
                        {TYPE_LABEL[result.type]}
                        {result.status === "PUBLISHED" ? "" : " · rascunho"}
                      </span>
                    </span>
                    {already ? (
                      <span className="shrink-0 text-xs font-semibold text-muted">No carrossel</span>
                    ) : (
                      <form action={addHeroSlide} className="shrink-0">
                        <input type="hidden" name="type" value={result.type} />
                        <input type="hidden" name="id" value={result.id} />
                        <input type="hidden" name="back" value={BASE} />
                        <button
                          type="submit"
                          disabled={full}
                          className={PRIMARY_BUTTON + " px-3 py-1.5 text-xs"}
                        >
                          Adicionar
                        </button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Nada encontrado para “{term}”.</p>
          )
        ) : null}
      </Card>
    </>
  );
}
