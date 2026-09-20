"use client";

import { useActionState } from "react";
import { deleteCategory, saveCategory } from "@/app/admin/actions/content";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Field, Select, SubmitButton, TextInput } from "@/components/admin/form";

type Category = { id: string; name: string; slug: string; type: string };

const TYPES = [
  { value: "ARTICLE", label: "Matérias" },
  { value: "EVENT", label: "Eventos" },
  { value: "PROPERTY", label: "Imóveis" },
  { value: "VIDEO", label: "Vídeos" },
];

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState(saveCategory, {});

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <form action={formAction} className="h-fit border border-line bg-surface p-6">
        <h2 className="font-display text-xl">Nova categoria</h2>

        <div className="mt-5 grid gap-5">
          <Field label="Nome" htmlFor="name" required>
            <TextInput id="name" name="name" required />
          </Field>

          <Field
            label="Módulo"
            htmlFor="type"
            hint="A categoria aparece apenas no módulo escolhido."
          >
            <Select id="type" name="type" defaultValue="ARTICLE">
              {TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </Field>

          {state.error ? <p className="text-sm text-brand">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}

          <SubmitButton>Criar categoria</SubmitButton>
        </div>
      </form>

      <div className="grid gap-6 sm:grid-cols-2">
        {TYPES.map((type) => {
          const list = categories.filter((category) => category.type === type.value);
          return (
            <div key={type.value} className="border border-line bg-surface p-5">
              <p className="eyebrow text-muted">{type.label}</p>
              {list.length ? (
                <ul className="mt-3 divide-y divide-[color:var(--color-line)]">
                  {list.map((category) => (
                    <li key={category.id} className="flex items-center justify-between py-2 text-sm">
                      <span>{category.name}</span>
                      <DeleteButton
                        id={category.id}
                        action={deleteCategory}
                        label="remover"
                        confirmMessage="Remover esta categoria? Os conteúdos ficam sem ela."
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted">Nenhuma categoria.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
