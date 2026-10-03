"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "./theme";

// O tema vive no atributo data-theme do <html> (aplicado pelo script do layout
// antes da pintura). A chave so le e escreve esse atributo.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.dataset.theme === "dark";

/** Chave "Tema escuro" do pe do menu. Vale so para o painel e fica salva no navegador. */
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = !dark;
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Navegador sem armazenamento: o tema vale so ate recarregar.
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      onClick={toggle}
      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white"
    >
      Tema escuro
      <span
        aria-hidden
        className={
          "relative h-6 w-11 rounded-full transition-colors " +
          (dark ? "bg-[#4f6bff]" : "bg-white/30")
        }
      >
        <span
          className={
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " +
            (dark ? "translate-x-5" : "")
          }
        />
      </span>
    </button>
  );
}
