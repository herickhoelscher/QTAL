"use client";

type Props = {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
  confirmMessage?: string;
  /** "link" nas linhas das listas; "button" (pilula rosa) no pe da pagina Ver. */
  variant?: "link" | "button";
  /** Para onde ir depois de excluir (a pagina Ver deixa de existir). */
  redirectTo?: string;
};

/** Exclusao sempre confirmada: o painel e operado por quem nao tem rede de seguranca tecnica. */
export function DeleteButton({
  id,
  action,
  label = "Excluir",
  confirmMessage = "Excluir definitivamente? Esta ação não pode ser desfeita.",
  variant = "link",
  redirectTo,
}: Props) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="inline"
    >
      <input type="hidden" name="id" value={id} />
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      <button
        type="submit"
        className={
          variant === "button"
            ? "rounded-xl border border-danger/30 bg-danger/5 px-4 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
            : "font-semibold text-danger hover:underline"
        }
      >
        {label}
      </button>
    </form>
  );
}
