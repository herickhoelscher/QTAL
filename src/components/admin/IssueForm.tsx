"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveIssue } from "@/app/admin/actions/content";
import { ImageField } from "@/components/admin/ImageField";
import {
  Field,
  FormSection,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/admin/form";

export type IssueFormData = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string | null;
  coverImage?: string | null;
  status?: string;
  articleIds?: string[];
};

type ArticleOption = { id: string; title: string };

/**
 * Monta a sequencia de leitura do Modo Revista: a ordem da lista da direita e
 * exatamente a ordem em que as materias serao folheadas.
 */
export function IssueForm({
  issue = {},
  articles,
}: {
  issue?: IssueFormData;
  articles: ArticleOption[];
}) {
  const [state, formAction] = useActionState(saveIssue, {});
  const [selected, setSelected] = useState<string[]>(issue.articleIds ?? []);

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

      {state.error ? (
        <p role="alert" className="border-l-2 border-brand bg-surface p-3 text-sm text-brand">
          {state.error}
        </p>
      ) : null}

      <FormSection title="Edição">
        <Field label="Título" htmlFor="title" required>
          <TextInput id="title" name="title" defaultValue={issue.title} required />
        </Field>
        <Field label="Endereço da página (slug)" htmlFor="slug" hint="Em branco, gera pelo título.">
          <TextInput id="slug" name="slug" defaultValue={issue.slug} />
        </Field>
        <Field label="Descrição" htmlFor="description">
          <TextArea
            id="description"
            name="description"
            rows={3}
            defaultValue={issue.description ?? ""}
          />
        </Field>
        <ImageField
          name="coverImage"
          label="Capa da edição"
          hint="JPG ou WEBP, 1200×1600px (retrato, 3:4), até 5MB. É a capa exibida na chamada do Modo Revista."
          defaultValue={issue.coverImage}
        />
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={issue.status ?? "DRAFT"}>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
          </Select>
        </Field>
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
                      className="text-brand"
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

      <div className="flex items-center gap-4">
        <SubmitButton>Salvar edição</SubmitButton>
        <Link href="/admin/edicoes" className="text-sm text-muted hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
