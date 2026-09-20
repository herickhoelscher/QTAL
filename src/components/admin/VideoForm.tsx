"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveVideo } from "@/app/admin/actions/content";
import { ImageField } from "@/components/admin/ImageField";
import {
  Checkbox,
  Field,
  FormSection,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/admin/form";

export type VideoFormData = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string | null;
  externalUrl?: string;
  customThumbnail?: string | null;
  vertical?: boolean;
  eventId?: string | null;
  articleId?: string | null;
  propertyId?: string | null;
  featured?: boolean;
  status?: string;
  categoryIds?: string[];
};

export function VideoForm({
  video = {},
  events,
  articles,
  properties,
  categories,
}: {
  video?: VideoFormData;
  events: { id: string; title: string }[];
  articles: { id: string; title: string }[];
  properties: { id: string; title: string }[];
  categories: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(saveVideo, {});

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="id" value={video.id ?? ""} />

      {state.error ? (
        <p role="alert" className="border-l-2 border-brand bg-surface p-3 text-sm text-brand">
          {state.error}
        </p>
      ) : null}

      <FormSection
        title="Vídeo"
        description="O arquivo fica hospedado no YouTube ou no Instagram. Aqui você cadastra apenas o link."
      >
        <Field label="Título" htmlFor="title" required>
          <TextInput id="title" name="title" defaultValue={video.title} required />
        </Field>

        <Field
          label="Link do vídeo"
          htmlFor="externalUrl"
          hint="Cole o endereço completo: youtube.com/watch?v=…, youtu.be/…, youtube.com/shorts/… ou instagram.com/reel/…"
          required
        >
          <TextInput
            id="externalUrl"
            name="externalUrl"
            defaultValue={video.externalUrl}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
        </Field>

        <Field label="Endereço da página (slug)" htmlFor="slug" hint="Em branco, gera pelo título.">
          <TextInput id="slug" name="slug" defaultValue={video.slug} />
        </Field>

        <Field label="Descrição" htmlFor="description">
          <TextArea
            id="description"
            name="description"
            rows={4}
            defaultValue={video.description ?? ""}
          />
        </Field>

        <Checkbox
          name="vertical"
          label="Vídeo vertical (Reels, Shorts, TikTok)"
          hint="Marque para o vídeo ocupar a tela inteira no feed. Links de /shorts/ e /reel/ já vêm marcados."
          defaultChecked={video.vertical}
        />

        <ImageField
          name="customThumbnail"
          label="Capa personalizada (opcional)"
          hint="JPG ou WEBP — 1280×720px (16:9) para vídeo deitado, 1080×1920px (9:16) para vertical, até 5MB. Sem isso, usamos a capa do próprio YouTube."
          defaultValue={video.customThumbnail}
        />
      </FormSection>

      <FormSection
        title="Vínculo e publicação"
        description="O vídeo é cadastrado uma vez só. Cada vínculo abaixo faz ele aparecer também naquela página — e ele continua na listagem geral de Vídeos de qualquer jeito."
      >
        <Field
          label="Evento relacionado"
          htmlFor="eventId"
          hint="Aparece na galeria do evento, junto com as fotos."
        >
          <Select id="eventId" name="eventId" defaultValue={video.eventId ?? ""}>
            <option value="">Nenhum</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Matéria relacionada"
          htmlFor="articleId"
          hint="Aparece no fim da matéria, depois do texto e da galeria de fotos."
        >
          <Select id="articleId" name="articleId" defaultValue={video.articleId ?? ""}>
            <option value="">Nenhuma</option>
            {articles.map((article) => (
              <option key={article.id} value={article.id}>
                {article.title}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Imóvel relacionado"
          htmlFor="propertyId"
          hint="Aparece na ficha do imóvel — use para tour virtual e visita guiada."
        >
          <Select id="propertyId" name="propertyId" defaultValue={video.propertyId ?? ""}>
            <option value="">Nenhum</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.title}
              </option>
            ))}
          </Select>
        </Field>

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
                    defaultChecked={video.categoryIds?.includes(category.id)}
                    className="h-4 w-4 accent-[color:var(--color-brand)]"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">
              Nenhuma categoria de vídeo cadastrada.{" "}
              <Link href="/admin/categorias" className="text-brand underline">
                Criar categorias
              </Link>
            </p>
          )}
        </fieldset>

        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={video.status ?? "DRAFT"}>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
          </Select>
        </Field>

        <Checkbox name="featured" label="Destacar na home" defaultChecked={video.featured} />
      </FormSection>

      <div className="flex items-center gap-4">
        <SubmitButton>Salvar vídeo</SubmitButton>
        <Link href="/admin/videos" className="text-sm text-muted hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
