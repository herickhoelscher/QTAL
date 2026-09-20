"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Escalonamento padrao dos cards: para de crescer no setimo item, senao o fim
    de uma lista longa ficaria esperando segundos para aparecer. */
const STEP = 0.07;
const MAX_STEPS = 6;

/**
 * Entrada suave de um bloco quando ele chega na viewport.
 *
 * Duas regras que mantem isso discreto em vez de cansativo: anima uma unica vez
 * (`once`) e sai do caminho quando o sistema pede menos movimento
 * (`prefers-reduced-motion`), devolvendo o conteudo estatico.
 *
 * O `delay` serve para escalonar cards de uma mesma grade — some depois dos
 * primeiros itens para o final da lista nao ficar esperando.
 */
export function Reveal({
  children,
  delay,
  index,
  y = 24,
  className,
}: {
  children: ReactNode;
  delay?: number;
  /** Posicao do item na grade; o atraso escalonado e calculado aqui dentro. */
  index?: number;
  y?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const wait = delay ?? (index != null ? Math.min(index, MAX_STEPS) * STEP : 0);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: wait, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
