"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CONTROL, PRIMARY_BUTTON, SECONDARY_BUTTON } from "@/components/admin/styles";

export function Field({
  label,
  htmlFor,
  hint,
  required,
  wide,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  /** Ocupa as duas colunas do FormSection (textos longos, editor, imagens). */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={"flex flex-col gap-1.5" + (wide ? " md:col-span-2" : "")}>
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-ink">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={CONTROL + " " + (props.className ?? "")} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={CONTROL + " " + (props.className ?? "")} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={CONTROL + " " + (props.className ?? "")} />;
}

/** Senha com o botao de olho para mostrar o que foi digitado. */
export function PasswordInput(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex overflow-hidden rounded-xl border border-line bg-surface focus-within:border-ink focus-within:ring-1 focus-within:ring-ink">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className="w-full bg-transparent px-4 py-2.5 text-sm text-ink outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Esconder senha" : "Mostrar senha"}
        aria-pressed={visible}
        className="flex w-11 shrink-0 items-center justify-center border-l border-line text-muted hover:text-ink"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {visible ? <path d="M3 3l18 18" /> : null}
        </svg>
      </button>
    </div>
  );
}

export function Checkbox({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  /** Mesma funcao do hint dos campos de texto: instruir antes do erro. */
  hint?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name={name}
          value="on"
          defaultChecked={defaultChecked}
          className="h-4 w-4 rounded accent-[color:var(--color-brand)]"
        />
        {label}
      </label>
      {hint ? <p className="mt-1 ml-6 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function SubmitButton({ children = "Salvar" }: { children?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={PRIMARY_BUTTON}>
      {pending ? "Salvando…" : children}
    </button>
  );
}

/** Rodape do formulario: Cancelar e o botao principal, alinhados a direita. */
export function FormActions({
  cancelHref,
  children,
}: {
  cancelHref?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {cancelHref ? (
        <Link href={cancelHref} className={SECONDARY_BUTTON}>
          Cancelar
        </Link>
      ) : null}
      <SubmitButton>{children}</SubmitButton>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
    >
      {message}
    </p>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] md:p-6">
      {title ? <h2 className="text-base font-bold text-ink">{title}</h2> : null}
      {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      <div className={"grid gap-x-4 gap-y-4 md:grid-cols-2" + (title ? " mt-5" : "")}>
        {children}
      </div>
    </section>
  );
}
