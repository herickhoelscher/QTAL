"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProperty } from "@/app/admin/actions/content";
import { GalleryField, type GalleryItem } from "@/components/admin/GalleryField";
import { ImageField } from "@/components/admin/ImageField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  Checkbox,
  Field,
  FormSection,
  Select,
  SubmitButton,
  TextInput,
} from "@/components/admin/form";

export type PropertyFormData = {
  id?: string;
  title?: string;
  slug?: string;
  type?: string;
  city?: string;
  region?: string | null;
  address?: string | null;
  price?: string;
  priceOnRequest?: boolean;
  area?: string;
  bedrooms?: string;
  bathrooms?: string;
  garageSpots?: string;
  description?: string;
  coverImage?: string | null;
  coverAlt?: string | null;
  mapEmbedUrl?: string | null;
  tourUrl?: string | null;
  featured?: boolean;
  status?: string;
  gallery?: GalleryItem[];
};

const TYPES = [
  { value: "CASA", label: "Casa" },
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "TERRENO", label: "Terreno" },
  { value: "COMERCIAL", label: "Comercial" },
  { value: "RURAL", label: "Rural" },
];

export function PropertyForm({ property = {} }: { property?: PropertyFormData }) {
  const [state, formAction] = useActionState(saveProperty, {});

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="id" value={property.id ?? ""} />

      {state.error ? (
        <p role="alert" className="border-l-2 border-brand bg-surface p-3 text-sm text-brand">
          {state.error}
        </p>
      ) : null}

      <FormSection title="Identificação">
        <Field label="Título do anúncio" htmlFor="title" required>
          <TextInput id="title" name="title" defaultValue={property.title} required />
        </Field>

        <Field label="Endereço da página (slug)" htmlFor="slug" hint="Em branco, gera pelo título.">
          <TextInput id="slug" name="slug" defaultValue={property.slug} />
        </Field>

        <Field label="Tipo" htmlFor="type" required>
          <Select id="type" name="type" defaultValue={property.type ?? "CASA"}>
            {TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Cidade" htmlFor="city" required>
            <TextInput id="city" name="city" defaultValue={property.city} required />
          </Field>
          <Field label="Região / bairro" htmlFor="region">
            <TextInput id="region" name="region" defaultValue={property.region ?? ""} />
          </Field>
        </div>

        <Field label="Endereço" htmlFor="address" hint="Aparece na ficha, ao lado do contato.">
          <TextInput id="address" name="address" defaultValue={property.address ?? ""} />
        </Field>
      </FormSection>

      <FormSection title="Ficha técnica">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Valor (R$)" htmlFor="price" hint="Apenas números, ex.: 750000">
            <TextInput id="price" name="price" inputMode="decimal" defaultValue={property.price} />
          </Field>
          <div className="flex items-end pb-2">
            <Checkbox
              name="priceOnRequest"
              label="Valor sob consulta"
              defaultChecked={property.priceOnRequest}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-4">
          <Field label="Área (m²)" htmlFor="area">
            <TextInput id="area" name="area" inputMode="decimal" defaultValue={property.area} />
          </Field>
          <Field label="Quartos" htmlFor="bedrooms">
            <TextInput id="bedrooms" name="bedrooms" inputMode="numeric" defaultValue={property.bedrooms} />
          </Field>
          <Field label="Banheiros" htmlFor="bathrooms">
            <TextInput id="bathrooms" name="bathrooms" inputMode="numeric" defaultValue={property.bathrooms} />
          </Field>
          <Field label="Vagas" htmlFor="garageSpots">
            <TextInput
              id="garageSpots"
              name="garageSpots"
              inputMode="numeric"
              defaultValue={property.garageSpots}
            />
          </Field>
        </div>

        <RichTextEditor
          name="description"
          label="Descrição"
          defaultValue={property.description ?? ""}
          hint="Destaque acabamentos, posição do sol, condomínio e diferenciais."
        />
      </FormSection>

      <FormSection title="Imagens e mídia">
        <ImageField
          name="coverImage"
          label="Foto de capa"
          hint="JPG ou WEBP, 1600×1200px (4:3), até 5MB. É a primeira imagem vista na listagem."
          defaultValue={property.coverImage}
        />
        <Field label="Descrição da capa" htmlFor="coverAlt">
          <TextInput id="coverAlt" name="coverAlt" defaultValue={property.coverAlt ?? ""} />
        </Field>

        <GalleryField
          name="gallery"
          label="Galeria de fotos"
          hint="JPG ou WEBP, 1600×1200px, até 5MB por foto. A ordem definida aqui é a ordem exibida na ficha."
          defaultValue={property.gallery ?? []}
        />

        <Field
          label="Tour virtual (link)"
          htmlFor="tourUrl"
          hint="Cole o link do tour 360° ou do vídeo do imóvel."
        >
          <TextInput id="tourUrl" name="tourUrl" defaultValue={property.tourUrl ?? ""} />
        </Field>

        <Field
          label="Mapa (link de incorporação do Google Maps)"
          htmlFor="mapEmbedUrl"
          hint="No Google Maps: Compartilhar → Incorporar um mapa → copie apenas o endereço que aparece em src."
        >
          <TextInput id="mapEmbedUrl" name="mapEmbedUrl" defaultValue={property.mapEmbedUrl ?? ""} />
        </Field>
      </FormSection>

      <FormSection title="Publicação">
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={property.status ?? "DRAFT"}>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
          </Select>
        </Field>
        <Checkbox name="featured" label="Destacar na home" defaultChecked={property.featured} />
      </FormSection>

      <div className="flex items-center gap-4">
        <SubmitButton>Salvar imóvel</SubmitButton>
        <Link href="/admin/imoveis" className="text-sm text-muted hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
