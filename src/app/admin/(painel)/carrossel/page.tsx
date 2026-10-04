import Link from "next/link";
import { addHeroSlide, removeHeroSlide, reorderHeroSlide } from "@/app/admin/actions/featured";
import { CONTROL, PRIMARY_BUTTON } from "@/components/admin/styles";
import { AdminEmpty, AdminHeading, AdminTable, Card, Cell, Pill, Row } from "@/components/admin/ui";
import { HERO_LIMIT } from "@/lib/featured";
import { formatDateShort } from "@/lib/format";
import { heroCandidates, heroItem, loadHeroSlides, type HeroType } from "@/lib/hero";

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

/** Abas do "Adicionar ao carrossel": uma por secao do site. */
const TABS = [
  { key: "materias", type: "article", label: "Matérias", empty: "Nenhuma matéria encontrada" },
  { key: "eventos", type: "event", label: "Eventos", empty: "Nenhum evento encontrado" },
  { key: "imoveis", type: "property", label: "Imóveis", empty: "Nenhum imóvel encontrado" },
  { key: "videos", type: "video", label: "Vídeos", empty: "Nenhum vídeo encontrado" },
  { key: "edicoes", type: "issue", label: "Edições", empty: "Nenhuma edição encontrada" },
] as const satisfies readonly { key: string; type: HeroType; label: string; empty: string }[];

type Tab = (typeof TABS)[number];

/** Quantos itens a aba mostra de cada vez; "Mostrar mais" soma outro tanto. */
const PAGE = 10;
const MAX_SHOWN = 100;

function tabHref(tab: Tab, q = "", shown = PAGE): string {
  const params = new URLSearchParams({ aba: tab.key });
  if (q) params.set("q", q);
  if (shown > PAGE) params.set("qtd", String(shown));
  return BASE + "?" + params.toString();
}

function SlideButton({
  action,
  id,
  dir,
  label,
  disabled,
  back,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  dir?: "up" | "down";
  label: string;
  disabled?: boolean;
  back: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {dir ? <input type="hidden" name="dir" value={dir} /> : null}
      <input type="hidden" name="back" value={back} />
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
  searchParams: Promise<{ aba?: string; q?: string; qtd?: string; aviso?: string }>;
}) {
  const { aba, q = "", qtd, aviso } = await searchParams;
  const tab = TABS.find((item) => item.key === aba) ?? TABS[0];
  const term = q.trim();
  const shown = Math.min(MAX_SHOWN, Math.max(PAGE, Math.ceil(Number(qtd) / PAGE) * PAGE || PAGE));
  // Depois de adicionar, subir ou remover, volta para a mesma aba e busca.
  const here = tabHref(tab, term, shown);

  const [rows, found] = await Promise.all([
    loadHeroSlides(),
    heroCandidates(tab.type, term, shown + 1),
  ]);
  const slides = rows.map(heroItem).filter((item) => item !== null);
  const inHero = new Set(slides.map((slide) => slide.type + ":" + slide.id));
  const full = slides.length >= HERO_LIMIT;
  const candidates = found.slice(0, shown);
  const hasMore = found.length > shown && shown < MAX_SHOWN;

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
                    back={here}
                  />
                  <SlideButton
                    action={reorderHeroSlide}
                    id={slide.slideId}
                    dir="down"
                    label="Descer"
                    disabled={index === slides.length - 1}
                    back={here}
                  />
                  <SlideButton
                    action={removeHeroSlide}
                    id={slide.slideId}
                    label="Remover"
                    back={here}
                  />
                </div>
              </td>
            </Row>
          ))}
        </AdminTable>
      ) : (
        <AdminEmpty>
          O carrossel está vazio. Enquanto isso, a home mostra as 3 matérias mais recentes. Escolha
          os slides nas abas abaixo.
        </AdminEmpty>
      )}

      <Card className="mt-8 p-5 md:p-6">
        <h2 className="text-base font-bold text-ink">Adicionar ao carrossel</h2>
        <p className="mt-0.5 text-sm text-muted">
          Escolha a seção e clique em Adicionar. A busca procura pelo título dentro da aba.
        </p>

        <nav aria-label="Seções" className="mt-4 flex flex-wrap gap-2">
          {TABS.map((item) => {
            const current = item.key === tab.key;
            return (
              <Link
                key={item.key}
                href={tabHref(item)}
                aria-current={current ? "page" : undefined}
                className={
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-colors " +
                  (current
                    ? "bg-brand text-on-brand"
                    : "text-muted hover:bg-surface-alt hover:text-ink")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form method="get" className="mt-4 flex gap-3" role="search">
          <input type="hidden" name="aba" value={tab.key} />
          <label htmlFor="busca-carrossel" className="sr-only">
            Buscar em {tab.label.toLowerCase()}
          </label>
          <input
            id="busca-carrossel"
            name="q"
            type="search"
            defaultValue={term}
            placeholder={"Buscar em " + tab.label.toLowerCase()}
            className={CONTROL}
          />
          <button type="submit" className={PRIMARY_BUTTON + " px-5"}>
            Buscar
          </button>
        </form>

        {full ? (
          <p className="mt-4 text-sm font-semibold text-danger">
            O carrossel está cheio ({HERO_LIMIT}/{HERO_LIMIT}). Remova um slide para adicionar outro.
          </p>
        ) : null}

        {candidates.length ? (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
            {candidates.map((item) => {
              const already = inHero.has(tab.type + ":" + item.id);
              return (
                <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="flex min-w-0 items-center gap-3">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt=""
                        className="h-10 w-16 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <span className="h-10 w-16 shrink-0 rounded-md bg-surface-alt" />
                    )}
                    <span className="min-w-0 text-sm">
                      <span className="block truncate font-semibold text-ink">{item.title}</span>
                      <span className="text-xs text-muted">
                        {item.date ? formatDateShort(item.date) : "Sem data"}
                        {item.status === "PUBLISHED" ? "" : " · rascunho, não aparece no site"}
                      </span>
                    </span>
                  </span>
                  {already ? (
                    <span className="shrink-0 text-xs font-semibold text-muted">No carrossel</span>
                  ) : (
                    <form action={addHeroSlide} className="shrink-0">
                      <input type="hidden" name="type" value={tab.type} />
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="back" value={here} />
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
          <p className="mt-4 text-sm text-muted">
            {tab.empty}
            {term ? ` para “${term}”.` : "."}
          </p>
        )}

        {hasMore ? (
          <div className="mt-4 text-center">
            <Link
              href={tabHref(tab, term, shown + PAGE)}
              scroll={false}
              className="text-sm font-semibold text-link hover:underline"
            >
              Mostrar mais
            </Link>
          </div>
        ) : null}
      </Card>
    </>
  );
}
