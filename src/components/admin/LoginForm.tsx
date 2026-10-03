"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/admin/actions/auth";
import { Field, FormError, PasswordInput, TextInput } from "@/components/admin/form";

function EnterButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-brand px-4 py-2.5 text-xs font-bold text-on-brand transition-colors hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, {});

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <Field label="E-mail" htmlFor="email">
        <TextInput id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </Field>

      <Field label="Senha" htmlFor="password">
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </Field>

      <FormError message={state.error} />

      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" name="remember" value="on" className="h-3.5 w-3.5 rounded" />
          Lembrar de mim
        </label>
        <EnterButton />
      </div>
    </form>
  );
}
