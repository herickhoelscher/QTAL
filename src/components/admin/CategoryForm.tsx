"use client";

import { useActionState } from "react";
import { saveCategory } from "@/app/admin/actions/content";
import {
  Field,
  FormActions,
  FormError,
  FormSection,
  Select,
  TextInput,
} from "@/components/admin/form";
import { CATEGORY_TYPES } from "@/components/admin/labels";

export type CategoryFormData = { id?: string; name?: string; type?: string };

export function CategoryForm({ category = {} }: { category?: CategoryFormData }) {
  const [state, formAction] = useActionState(saveCategory, {});

  return (
    <form action={formAction}>
      <FormSection>
        <input type="hidden" name="id" value={category.id ?? ""} />

        <Field label="Nome" htmlFor="name" required>
          <TextInput id="name" name="name" defaultValue={category.name} required />
        </Field>
        <div className="hidden md:block" />

        <Field label="Tipo" htmlFor="type" hint="Em qual seção do site a categoria aparece.">
          <Select id="type" name="type" defaultValue={category.type ?? "ARTICLE"}>
            {CATEGORY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 md:col-span-2">
          <FormError message={state.error} />
          <FormActions cancelHref="/admin/categorias">
            {category.id ? "Atualizar categoria" : "Criar categoria"}
          </FormActions>
        </div>
      </FormSection>
    </form>
  );
}
