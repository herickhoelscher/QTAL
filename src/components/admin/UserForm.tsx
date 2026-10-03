"use client";

import { useActionState } from "react";
import { saveUser } from "@/app/admin/actions/auth";
import {
  Checkbox,
  Field,
  FormActions,
  FormError,
  FormSection,
  PasswordInput,
  Select,
  TextInput,
} from "@/components/admin/form";

export type UserFormData = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  active?: boolean;
};

export function UserForm({ user = {} }: { user?: UserFormData }) {
  const [state, formAction] = useActionState(saveUser, {});
  const editing = Boolean(user.id);

  return (
    <form action={formAction}>
      <FormSection>
        <input type="hidden" name="id" value={user.id ?? ""} />

        <Field label="Nome" htmlFor="name" required>
          <TextInput id="name" name="name" defaultValue={user.name} required />
        </Field>

        <Field label="E-mail" htmlFor="email" required>
          <TextInput id="email" name="email" type="email" defaultValue={user.email} required />
        </Field>

        <Field
          label="Perfil"
          htmlFor="role"
          hint="Editor publica conteúdo. Administrador também altera configurações e usuários."
        >
          <Select id="role" name="role" defaultValue={user.role ?? "EDITOR"}>
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Administrador</option>
          </Select>
        </Field>

        <div className="flex items-center md:pt-6">
          <Checkbox name="active" label="Acesso liberado" defaultChecked={user.active ?? true} />
        </div>

        <Field
          label="Senha"
          htmlFor="password"
          hint={editing ? "Deixe em branco para manter a senha atual." : "Mínimo de 8 caracteres."}
          required={!editing}
        >
          <PasswordInput id="password" name="password" autoComplete="new-password" required={!editing} />
        </Field>

        <Field label="Confirmação de senha" htmlFor="passwordConfirmation" required={!editing}>
          <PasswordInput
            id="passwordConfirmation"
            name="passwordConfirmation"
            autoComplete="new-password"
            required={!editing}
          />
        </Field>

        <div className="grid gap-4 md:col-span-2">
          <FormError message={state.error} />
          <FormActions cancelHref="/admin/usuarios">
            {editing ? "Atualizar usuário" : "Criar usuário"}
          </FormActions>
        </div>
      </FormSection>
    </form>
  );
}
