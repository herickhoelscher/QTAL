"use client";

import { useRef, useState } from "react";

/**
 * Campo de upload de imagem.
 *
 * A instrucao de formato/dimensao aparece SEMPRE, antes do envio: e um pedido
 * explicito do cliente para reduzir chamados de suporte (secao 6.9). Por isso
 * `hint` e obrigatorio na tipagem deste componente.
 */
export function ImageField({
  name,
  label,
  hint,
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  hint: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const json = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !json.url) throw new Error(json.error ?? "Falha no upload.");
      setUrl(json.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">
        {label}
        {required ? <span className="text-brand"> *</span> : null}
      </span>

      <p className="text-xs text-muted">{hint}</p>

      <input type="hidden" name={name} value={url} />

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
          className="text-sm file:mr-3 file:border file:border-line file:bg-surface-alt file:px-4 file:py-2 file:text-sm"
        />
        {uploading ? <span className="text-xs text-muted">Enviando…</span> : null}
        {url ? (
          <button
            type="button"
            onClick={() => {
              setUrl("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-xs text-brand underline"
          >
            Remover imagem
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-brand">{error}</p> : null}

      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-2 h-32 w-auto border border-line object-cover" />
      ) : null}
    </div>
  );
}
