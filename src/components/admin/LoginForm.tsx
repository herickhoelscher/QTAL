"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions/auth";
import { Field, SubmitButton, TextInput } from "@/components/admin/form";

export function LoginForm() {
  const [state, formAction] = useActionState(login, {});

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <Field label="E-mail" htmlFor="email" required>
        <TextInput id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <Field label="Senha" htmlFor="password" required>
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      {state.error ? (
        <p role="alert" className="border-l-2 border-brand bg-surface-alt p-3 text-sm text-brand">
          {state.error}
        </p>
      ) : null}

      <SubmitButton>Entrar</SubmitButton>
    </form>
  );
}
