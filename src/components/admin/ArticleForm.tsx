"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveArticle } from "@/app/admin/actions/content";
import { GalleryField, type GalleryItem } from "@/components/admin/GalleryField";
import { ImageField } from "@/components/admin/ImageField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  Checkbox,
  Field,
  FormSection,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/admin/form";

export type ArticleFormData = {
  id?: string;
  title?: string;
  slug?: string;
  subtitle?: string | null;
  body?: string;
  coverImage?: string | null;
  coverAlt?: string | null;
  region?: string | null;
  status?: string;
  featured?: boolean;
  publishedAt?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  categoryIds?: string[];
  gallery?: GalleryItem[];
};

export function ArticleForm({
  article = {},
  categories,
}: {
  article?: ArticleFormData;
  categories: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(saveArticle, {});

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="id" value={article.id ?? ""} />

      {state.error ? (
        <p role="alert" className="border-l-2 border-brand bg-surface p-3 text-sm text-brand">
          {state.error}
        </p>
      ) : null}

      <FormSection title="Conteúdo">
        <Field label="Título" htmlFor="title" required>
          <TextInput id="title" name="title" defaultValue={article.title} required />
        </Field>

        <Field
          label="Endereço da página (slug)"
          htmlFor="slug"
          hint="Deixe em branco para gerar automaticamente a partir do título."
        >
          <TextInput id="slug" name="slug" defaultValue={article.slug} placeholder="minha-materia" />
        </Field>

        <Field label="Linha de apoio" htmlFor="subtitle" hint="Aparece abaixo do título e nos cards.">
          <TextInput id="subtitle" name="subtitle" defaultValue={article.subtitle ?? ""} />
        </Field>

        <RichTextEditor name="body" defaultValue={article.body ?? ""} />
      </FormSection>

      <FormSection title="Imagens">
        <ImageField
          name="coverImage"
          label="Imagem de capa"
          hint="JPG ou WEBP, 1600×900px (proporção 16:9), até 5MB. É a imagem do topo da matéria e do compartilhamento em redes sociais."
          defaultValue={article.coverImage}
        />
        <Field
          label="Descrição da capa"
          htmlFor="coverAlt"
          hint="Descreva a imagem em uma frase — leitores de tela usam esse texto."
        >
          <TextInput id="coverAlt" name="coverAlt" defaultValue={article.coverAlt ?? ""} />
        </Field>

        <GalleryField
          name="gallery"
          label="Galeria da matéria (opcional)"
          hint="JPG ou WEBP, 1200×900px, até 5MB por foto. Você pode enviar várias de uma vez e reordenar."
          defaultValue={article.gallery ?? []}
        />
      </FormSection>

      <FormSection title="Classificação e publicação">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Categorias</legend>
          {categories.length ? (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="categories"
                    value={category.id}
                    defaultChecked={article.categoryIds?.includes(category.id)}
                    className="h-4 w-4 accent-[color:var(--color-brand)]"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">
              Nenhuma categoria cadastrada.{" "}
              <Link href="/admin/categorias" className="text-brand underline">
                Criar categorias
              </Link>
            </p>
          )}
        </fieldset>

        <Field label="Região" htmlFor="region" hint="Usada no filtro regional do dashboard.">
          <TextInput id="region" name="region" defaultValue={article.region ?? ""} />
        </Field>

        <Field label="Data de publicação" htmlFor="publishedAt">
          <TextInput
            id="publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={article.publishedAt}
          />
        </Field>

        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={article.status ?? "DRAFT"}>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
          </Select>
        </Field>

        <Checkbox name="featured" label="Destacar no carrossel da home" defaultChecked={article.featured} />
      </FormSection>

      <FormSection title="SEO" description="Como a matéria aparece no Google e nas redes sociais.">
        <Field
          label="Título para buscadores"
          htmlFor="metaTitle"
          hint="Até 60 caracteres. Em branco, usa o título da matéria."
        >
          <TextInput id="metaTitle" name="metaTitle" defaultValue={article.metaTitle ?? ""} />
        </Field>
        <Field
          label="Descrição para buscadores"
          htmlFor="metaDescription"
          hint="Até 160 caracteres. Em branco, usa a linha de apoio."
        >
          <TextArea
            id="metaDescription"
            name="metaDescription"
            rows={3}
            defaultValue={article.metaDescription ?? ""}
          />
        </Field>
      </FormSection>

      <div className="flex items-center gap-4">
        <SubmitButton>Salvar matéria</SubmitButton>
        <Link href="/admin/materias" className="text-sm text-muted hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
