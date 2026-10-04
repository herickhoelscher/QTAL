"use client";

import { useActionState, useState } from "react";
import { saveIssue } from "@/app/admin/actions/content";
import { GalleryField, type GalleryItem } from "@/components/admin/GalleryField";
import { ImageField } from "@/components/admin/ImageField";
import { CoverOverlay } from "@/components/IssueCover";
import { coverText } from "@/lib/issue-cover";
import {
  Checkbox,
  Field,
  FormActions,
  FormError,
  FormSection,
  Select,
  TextArea,
  TextInput,
} from "@/components/admin/form";

export type IssueFormData = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string | null;
  coverImage?: string | null;
  coverTitle?: string | null;
  coverSubtitle?: string | null;
  status?: string;
  featured?: boolean;
  articleIds?: string[];
  pages?: GalleryItem[];
};

type ArticleOption = { id: string; title: string };

/**
 * Monta a sequencia de leitura do Modo Revista: a ordem da lista da direita e
 * exatamente a ordem em que as materias serao folheadas.
 */
export function IssueForm({
  issue = {},
  articles,
  brand,
}: {
  issue?: IssueFormData;
  articles: ArticleOption[];
  /** Nome do site e logo, que vao no topo da capa montada. */
  brand: { siteName: string; clientLogoUrl: string | null };
}) {
  const [state, formAction] = useActionState(saveIssue, {});
  const [selected, setSelected] = useState<string[]>(issue.articleIds ?? []);
  const [cover, setCover] = useState({
    coverImage: issue.coverImage ?? null,
    coverTitle: issue.coverTitle ?? "",
    coverSubtitle: issue.coverSubtitle ?? "",
  });
  const preview = coverText({ title: issue.title ?? "", ...cover }, brand);

  const available = articles.filter((article) => !selected.includes(article.id));
  const byId = new Map(articles.map((article) => [article.id, article]));

  function move(index: number, offset: number) {
    setSelected((current) => {
      const next = [...current];
      const target = index + offset;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="id" value={issue.id ?? ""} />
      {selected.map((articleId) => (
        <input key={articleId} type="hidden" name="articleIds" value={articleId} />
      ))}

      <FormError message={state.error} />

      <FormSection title="Edição">
        <Field label="Título" htmlFor="title" required>
          <TextInput id="title" name="title" defaultValue={issue.title} required />
        </Field>
        <Field label="Endereço da página (slug)" htmlFor="slug" hint="Em branco, gera pelo título.">
          <TextInput id="slug" name="slug" defaultValue={issue.slug} />
        </Field>
        <Field wide label="Descrição" htmlFor="description">
          <TextArea
            id="description"
            name="description"
            rows={3}
            defaultValue={issue.description ?? ""}
          />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={issue.status ?? "DRAFT"}>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
          </Select>
        </Field>
        <Checkbox
          name="featured"
          label="Destaque"
          hint="Entra no fim da fila de destaques da seção (até 6). A ordem se ajusta na aba Destaques da lista."
          defaultChecked={issue.featured}
        />
      </FormSection>

      <FormSection
        title="Capa"
        description="Envie a foto sem textos e digite o título: o site escreve por cima o nome da revista, o título e o subtítulo. Se a capa já vem pronta, com textos, deixe o título em branco."
      >
        <div className="grid gap-4">
          <ImageField
            name="coverImage"
            label="Foto da capa"
            hint="JPG, PNG, GIF ou WEBP, 1200×1600px (retrato, 3:4), até 5MB. Aparece na faixa Edições anteriores e na página Edições."
            defaultValue={issue.coverImage}
            onChange={(url) => setCover((current) => ({ ...current, coverImage: url || null }))}
          />
          <Field
            label="Título da capa"
            htmlFor="coverTitle"
            hint="A manchete, em letras grandes. Com título, a capa entra como primeira página da revista."
          >
            <TextInput
              id="coverTitle"
              name="coverTitle"
              maxLength={90}
              value={cover.coverTitle}
              onChange={(event) =>
                setCover((current) => ({ ...current, coverTitle: event.target.value }))
              }
            />
          </Field>
          <Field label="Subtítulo da capa" htmlFor="coverSubtitle" hint="Uma ou duas linhas abaixo do título.">
            <TextArea
              id="coverSubtitle"
              name="coverSubtitle"
              rows={2}
              maxLength={160}
              value={cover.coverSubtitle}
              onChange={(event) =>
                setCover((current) => ({ ...current, coverSubtitle: event.target.value }))
              }
            />
          </Field>
        </div>

        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink">Prévia da capa</p>
          <div className="relative aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded-md bg-[#1b1d22] shadow-lg">
            {cover.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : null}
            {preview ? <CoverOverlay text={preview} /> : null}
          </div>
          <p className="mt-1.5 text-xs text-muted">
            O nome no topo é o nome do site em Configurações (ou o logo, se houver).
          </p>
        </div>
      </FormSection>

      <FormSection
        title="Páginas da revista"
        description="As páginas que o leitor folheia, na ordem, depois da capa. Sem páginas, a capa leva direto ao Modo Revista."
      >
        <GalleryField
          name="pages"
          label="Páginas"
          hint="JPG, PNG, GIF ou WEBP, 1200×1600px (retrato, 3:4), até 5MB por página. Envie todas de uma vez, na ordem; use mover para ajustar."
          defaultValue={issue.pages ?? []}
          withHighlight={false}
          numbered
        />
      </FormSection>

      <FormSection
        title="Sequência de leitura"
        description="A ordem abaixo é a ordem em que as matérias serão folheadas no Modo Revista."
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold">Matérias disponíveis</p>
            <ul className="max-h-80 overflow-y-auto border border-line">
              {available.length ? (
                available.map((article) => (
                  <li key={article.id} className="border-b border-line last:border-0">
                    <button
                      type="button"
                      onClick={() => setSelected((current) => [...current, article.id])}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-alt"
                    >
                      + {article.title}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3 py-4 text-sm text-muted">Todas já foram adicionadas.</li>
              )}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Nesta edição ({selected.length})</p>
            <ol className="max-h-80 overflow-y-auto border border-line">
              {selected.length ? (
                selected.map((articleId, index) => (
                  <li
                    key={articleId}
                    className="flex items-center gap-2 border-b border-line px-3 py-2 text-sm last:border-0"
                  >
                    <span className="text-muted tabular-nums">{index + 1}.</span>
                    <span className="min-w-0 flex-1 truncate">
                      {byId.get(articleId)?.title ?? articleId}
                    </span>
                    <button type="button" onClick={() => move(index, -1)} className="text-muted">
                      ↑
                    </button>
                    <button type="button" onClick={() => move(index, 1)} className="text-muted">
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelected((c) => c.filter((item) => item !== articleId))}
                      className="text-danger"
                    >
                      remover
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-3 py-4 text-sm text-muted">
                  Escolha as matérias na coluna ao lado.
                </li>
              )}
            </ol>
          </div>
        </div>
      </FormSection>

      <FormActions cancelHref="/admin/edicoes">
        {issue.id ? "Atualizar edição" : "Criar edição"}
      </FormActions>
    </form>
  );
}
