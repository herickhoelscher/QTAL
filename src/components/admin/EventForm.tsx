"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveEvent } from "@/app/admin/actions/content";
import { GalleryField, type GalleryItem } from "@/components/admin/GalleryField";
import { ImageField } from "@/components/admin/ImageField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Field, FormSection, Select, SubmitButton, TextInput } from "@/components/admin/form";

export type EventFormData = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  date?: string;
  location?: string | null;
  region?: string | null;
  coverImage?: string | null;
  coverAlt?: string | null;
  status?: string;
  categoryIds?: string[];
  gallery?: GalleryItem[];
};

export function EventForm({
  event = {},
  categories,
}: {
  event?: EventFormData;
  categories: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(saveEvent, {});

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="id" value={event.id ?? ""} />

      {state.error ? (
        <p role="alert" className="border-l-2 border-brand bg-surface p-3 text-sm text-brand">
          {state.error}
        </p>
      ) : null}

      <FormSection title="Dados do evento">
        <Field label="Título" htmlFor="title" required>
          <TextInput id="title" name="title" defaultValue={event.title} required />
        </Field>

        <Field
          label="Endereço da página (slug)"
          htmlFor="slug"
          hint="Deixe em branco para gerar a partir do título."
        >
          <TextInput id="slug" name="slug" defaultValue={event.slug} />
        </Field>

        <Field label="Data" htmlFor="date" required>
          <TextInput
            id="date"
            name="date"
            type="datetime-local"
            defaultValue={event.date}
            required
          />
        </Field>

        <Field label="Local" htmlFor="location" hint="Nome do espaço, casa de shows, salão.">
          <TextInput id="location" name="location" defaultValue={event.location ?? ""} />
        </Field>

        <Field label="Região" htmlFor="region" hint="Usada no filtro regional da listagem pública.">
          <TextInput id="region" name="region" defaultValue={event.region ?? ""} />
        </Field>

        <RichTextEditor
          name="description"
          label="Descrição"
          defaultValue={event.description ?? ""}
          hint="Texto de abertura da página do evento."
        />
      </FormSection>

      <FormSection title="Fotos">
        <ImageField
          name="coverImage"
          label="Imagem de capa"
          hint="JPG ou WEBP, 1600×900px (16:9), até 5MB. É a foto do topo da página e dos cards."
          defaultValue={event.coverImage}
        />
        <Field label="Descrição da capa" htmlFor="coverAlt">
          <TextInput id="coverAlt" name="coverAlt" defaultValue={event.coverAlt ?? ""} />
        </Field>

        <GalleryField
          name="gallery"
          label="Galeria do evento"
          hint="JPG ou WEBP, 1200×900px, até 5MB por foto. Selecione várias de uma vez. Preencha 'Bloco / álbum' para separar as fotos por momento (ex.: Chegada, Show, Encerramento)."
          defaultValue={event.gallery ?? []}
          withAlbums
        />
      </FormSection>

      <FormSection
        title="Classificação e publicação"
        description="Os vídeos do evento são cadastrados em Vídeos, vinculados a ele — e aparecem nas duas páginas."
      >
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
                    defaultChecked={event.categoryIds?.includes(category.id)}
                    className="h-4 w-4 accent-[color:var(--color-brand)]"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">
              Nenhuma categoria de evento cadastrada.{" "}
              <Link href="/admin/categorias" className="text-brand underline">
                Criar categorias
              </Link>
            </p>
          )}
        </fieldset>

        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={event.status ?? "DRAFT"}>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
          </Select>
        </Field>
      </FormSection>

      <div className="flex items-center gap-4">
        <SubmitButton>Salvar evento</SubmitButton>
        <Link href="/admin/eventos" className="text-sm text-muted hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
