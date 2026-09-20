"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Command = {
  label: string;
  title: string;
  command: string;
  value?: string;
  /** Pede o endereço antes de aplicar (usado pelo botão de link). */
  prompt?: string;
};

const COMMANDS: Command[] = [
  { label: "B", title: "Negrito", command: "bold" },
  { label: "I", title: "Itálico", command: "italic" },
  { label: "H2", title: "Título de seção", command: "formatBlock", value: "h2" },
  { label: "H3", title: "Subtítulo", command: "formatBlock", value: "h3" },
  { label: "¶", title: "Parágrafo", command: "formatBlock", value: "p" },
  { label: "“ ”", title: "Citação", command: "formatBlock", value: "blockquote" },
  { label: "• Lista", title: "Lista com marcadores", command: "insertUnorderedList" },
  { label: "1. Lista", title: "Lista numerada", command: "insertOrderedList" },
  { label: "Link", title: "Inserir link", command: "createLink", prompt: "Endereço do link (https://…)" },
  { label: "Limpar", title: "Remover formatação", command: "removeFormat" },
];

/**
 * Editor de texto rico do painel.
 *
 * Usa um contenteditable com os comandos de formatacao do proprio navegador:
 * cobre o que a redacao precisa (negrito, italico, titulos, listas, citacao e
 * link) sem trazer um pacote de editor para o bundle. O HTML gerado passa pelo
 * sanitizador do servidor antes de ser gravado.
 */
export function RichTextEditor({
  name,
  defaultValue = "",
  label = "Corpo do texto",
  hint = "Selecione o trecho e use os botões acima para formatar.",
}: {
  name: string;
  defaultValue?: string;
  label?: string;
  hint?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(defaultValue);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = defaultValue || "<p></p>";
    }
  }, [defaultValue]);

  const sync = useCallback(() => setHtml(editorRef.current?.innerHTML ?? ""), []);

  const run = useCallback(
    (item: Command) => {
      let value = item.value;
      if (item.prompt) {
        const answer = window.prompt(item.prompt);
        if (!answer) return;
        value = answer;
      }
      editorRef.current?.focus();
      document.execCommand(item.command, false, value);
      sync();
    },
    [sync],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">
        {label}
        <span className="text-brand"> *</span>
      </span>

      <div className="flex flex-wrap gap-1 border border-b-0 border-line bg-surface-alt p-2">
        {COMMANDS.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.title}
            onClick={() => run(item)}
            className="border border-line bg-surface px-2.5 py-1 text-xs hover:border-brand hover:text-brand"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        className="prose-editorial min-h-64 border border-line bg-surface px-4 py-3 outline-none focus:border-brand"
      />

      <input type="hidden" name={name} value={html} />
      <p className="text-xs text-muted">{hint}</p>
    </div>
  );
}
