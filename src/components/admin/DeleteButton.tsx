"use client";

type Props = {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
  confirmMessage?: string;
};

/** Exclusao sempre confirmada: o painel e operado por quem nao tem rede de seguranca tecnica. */
export function DeleteButton({
  id,
  action,
  label = "Excluir",
  confirmMessage = "Excluir definitivamente? Esta ação não pode ser desfeita.",
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
      <button type="submit" className="text-brand hover:underline">
        {label}
      </button>
    </form>
  );
}
