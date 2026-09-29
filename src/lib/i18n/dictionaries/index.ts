import type { Locale } from "../locales";
import { en } from "./en";
import { es } from "./es";
import { pt, type Dictionary } from "./pt";

export type { Dictionary };

/** Os tres dicionarios sao pequenos: carregar todos juntos sai mais barato que importar sob demanda. */
export const DICTIONARIES: Record<Locale, Dictionary> = { pt, en, es };
