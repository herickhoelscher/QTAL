"use client";

import { useEffect } from "react";

/**
 * Registra a visualizacao da materia. Fica no cliente de proposito: a pagina e
 * cacheada, entao contar no render do servidor perderia acessos.
 */
export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const key = "viewed:" + slug;
    try {
      // Uma visualizacao por sessao, para nao inflar a metrica com reloads.
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage indisponivel (janela anonima): conta normalmente
    }
    fetch("/api/materias/" + slug + "/view", { method: "POST", keepalive: true }).catch(
      () => undefined,
    );
  }, [slug]);

  return null;
}
