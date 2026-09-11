import type { Locale } from "@/lib/i18n/config";

/**
 * Stati di lettura, nell'ordine in cui vanno mostrati — che e' quello del ciclo
 * di vita di una serie: messa da parte, cominciata, e poi come e' finita.
 * I valori sono quelli dell'enum `reading_status` su Postgres e restano in
 * italiano: sono identificativi di dati, non testo da leggere. Le etichette
 * tradotte stanno in `lib/i18n/dictionaries/*` sotto `readingStatus`.
 */
export const READING_STATUSES = [
  "da_leggere",
  "in_corso",
  "completato",
  "in_pausa",
  "droppato",
] as const;

/** Stato di lettura di una serie. */
export type ReadingStatus = (typeof READING_STATUSES)[number];

/**
 * Profilo dell'utente (tabella `profiles`).
 * Le credenziali restano in `auth.users`, gestita da Supabase: qui ci sono
 * solo i dati che l'app scrive.
 */
export interface Profile {
  id: string;
  /** Puo' essere null: la registrazione non lo richiede. */
  displayName: string | null;
  preferredLocale: Locale;
  createdAt: string;
  updatedAt: string;
}

/** Una serie nella libreria di un utente. */
export interface MangaEntry {
  id: string;
  userId: string;
  /** Link alla pagina della serie sulla piattaforma di lettura. */
  seriesUrl: string;
  /** Link diretto all'ultimo capitolo letto, se disponibile. */
  chapterUrl: string | null;
  title: string;
  description: string | null;
  /**
   * Link alla copertina sul sito di origine. L'immagine non e' nostra: la
   * carica il browser, e puo' sparire se la piattaforma la rimuove.
   */
  coverUrl: string | null;
  /** Ultimo capitolo raggiunto (decimale: alcune serie usano 10.5). */
  currentChapter: number | null;
  status: ReadingStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** Metadata estratti da un link, prima del salvataggio. */
export interface ExtractedMetadata {
  title: string;
  description?: string;
  coverUrl?: string;
  sourceHost: string;
}
