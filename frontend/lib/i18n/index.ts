import { en } from "./dictionaries/en";
import { it, type Dictionary } from "./dictionaries/it";
import type { Locale } from "./config";

const DICTIONARIES: Record<Locale, Dictionary> = { it, en };

/**
 * Import statico e non dinamico: con due dizionari di poche decine di stringhe
 * il costo e' irrilevante, e in cambio non serve `await` in ogni componente.
 */
export const getDictionary = (locale: Locale): Dictionary =>
  DICTIONARIES[locale];

export type { Dictionary };
export * from "./config";
