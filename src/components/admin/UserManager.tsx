"use client";

import { useActionState, useState } from "react";
import { deleteUser, saveUser } from "@/app/admin/actions/auth";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  Checkbox,
  Field,
  Select,
  SubmitButton,
  TextInput,
} from "@/components/admin/form";
import { AdminTable } from "@/components/admin/ui";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export function UserManager({ users, currentId }: { users: User[]; currentId: string }) {
  const [state, formAction] = useActionState(saveUser, {});
  const [editing, setEditing] = useState<User | null>(null);

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      <form
        key={editing?.id ?? "novo"}
        action={formAction}
        className="h-fit border border-line bg-surface p-6"
      >
        <input type="hidden" name="id" value={editing?.id ?? ""} />

        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">{editing ? "Editar usuário" : "Novo usuário"}</h2>
          {editing ? (
            <button type="button" onClick={() => setEditing(null)} className="text-xs text-muted">
              cancelar
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-5">
          <Field label="Nome" htmlFor="name" required>
            <TextInput id="name" name="name" defaultValue={editing?.name} required />
          </Field>

          <Field label="E-mail" htmlFor="email" required>
            <TextInput id="email" name="email" type="email" defaultValue={editing?.email} required />
          </Field>

          <Field
            label="Senha"
            htmlFor="password"
            hint={
              editing
                ? "Deixe em branco para manter a senha atual."
                : "Mínimo de 8 caracteres."
            }
            required={!editing}
          >
            <TextInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required={!editing}
            />
          </Field>

          <Field
            label="Papel"
            htmlFor="role"
            hint="Editor publica conteúdo. Administrador também altera configurações e usuários."
          >
            <Select id="role" name="role" defaultValue={editing?.role ?? "EDITOR"}>
              <option value="EDITOR">Editor de conteúdo</option>
              <option value="ADMIN">Administrador geral</option>
            </Select>
          </Field>

          <Checkbox name="active" label="Acesso liberado" defaultChecked={editing?.active ?? true} />

          {state.error ? <p className="text-sm text-brand">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}

          <SubmitButton>{editing ? "Salvar alterações" : "Criar usuário"}</SubmitButton>
        </div>
      </form>

      <AdminTable headers={["Nome", "E-mail", "Papel", "Acesso", ""]}>
        {users.map((user) => (
          <tr key={user.id} className="border-b border-line last:border-0">
            <td className="px-4 py-3 font-semibold">{user.name}</td>
            <td className="px-4 py-3 text-muted">{user.email}</td>
            <td className="px-4 py-3 text-muted">
              {user.role === "ADMIN" ? "Administrador" : "Editor"}
            </td>
            <td className="px-4 py-3 text-muted">{user.active ? "Liberado" : "Bloqueado"}</td>
            <td className="px-4 py-3">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditing(user)}
                  className="text-brand hover:underline"
                >
                  Editar
                </button>
                {user.id === currentId ? (
                  <span className="text-xs text-muted">(você)</span>
                ) : (
                  <DeleteButton
                    id={user.id}
                    action={deleteUser}
                    confirmMessage="Remover o acesso desta pessoa ao painel?"
                  />
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
