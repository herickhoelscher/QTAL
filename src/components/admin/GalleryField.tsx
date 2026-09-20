"use client";

import { useState } from "react";

export type GalleryItem = { url: string; altText?: string | null; album?: string | null };

/**
 * Galeria de fotos do evento/imovel. Permite enviar varias imagens de uma vez,
 * reordenar, descrever e — no caso dos eventos — agrupar em blocos/albuns.
 * O valor final vai para o formulario como JSON em um campo escondido.
 */
export function GalleryField({
  name,
  label,
  hint,
  defaultValue = [],
  withAlbums = false,
}: {
  name: string;
  label: string;
  hint: string;
  defaultValue?: GalleryItem[];
  withAlbums?: boolean;
}) {
  const [items, setItems] = useState<GalleryItem[]>(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadMany(files: FileList) {
    setUploading(true);
    setError(null);
    const uploaded: GalleryItem[] = [];
    for (const file of Array.from(files)) {
      try {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const json = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !json.url) throw new Error(json.error ?? "Falha no upload.");
        uploaded.push({ url: json.url, altText: "", album: "" });
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Falha no upload.");
      }
    }
    setItems((current) => [...current, ...uploaded]);
    setUploading(false);
  }

  function update(index: number, patch: Partial<GalleryItem>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function move(index: number, offset: number) {
    setItems((current) => {
      const next = [...current];
      const target = index + offset;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <p className="text-xs text-muted">{hint}</p>

      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(event) => {
            if (event.target.files?.length) void uploadMany(event.target.files);
            event.target.value = "";
          }}
          className="text-sm file:mr-3 file:border file:border-line file:bg-surface-alt file:px-4 file:py-2 file:text-sm"
        />
        {uploading ? <span className="text-xs text-muted">Enviando…</span> : null}
      </div>

      {error ? <p className="text-xs text-brand">{error}</p> : null}

      {items.length ? (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <li key={item.url + index} className="flex gap-3 border border-line p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="h-20 w-20 shrink-0 object-cover" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <input
                  value={item.altText ?? ""}
                  onChange={(event) => update(index, { altText: event.target.value })}
                  placeholder="Descrição da imagem (acessibilidade)"
                  className="w-full border border-line px-2 py-1 text-xs"
                />
                {withAlbums ? (
                  <input
                    value={item.album ?? ""}
                    onChange={(event) => update(index, { album: event.target.value })}
                    placeholder="Bloco / álbum (opcional)"
                    className="w-full border border-line px-2 py-1 text-xs"
                  />
                ) : null}
                <div className="flex gap-3 text-xs">
                  <button type="button" onClick={() => move(index, -1)} className="text-muted">
                    ← mover
                  </button>
                  <button type="button" onClick={() => move(index, 1)} className="text-muted">
                    mover →
                  </button>
                  <button
                    type="button"
                    onClick={() => setItems((c) => c.filter((_, i) => i !== index))}
                    className="ml-auto text-brand"
                  >
                    remover
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
