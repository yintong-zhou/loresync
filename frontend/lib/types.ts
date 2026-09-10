/**
 * Stati di lettura, nell'ordine in cui vanno mostrati.
 * I valori sono quelli dell'enum `reading_status` su Postgres e restano in
 * italiano: sono identificativi di dati, non testo da leggere. Le etichette
 * tradotte stanno in `lib/i18n/dictionaries/*` sotto `readingStatus`.
 */
export const READING_STATUSES = [
  "in_corso",
  "completato",
  "in_pausa",
  "droppato",
] as const;

/** Stato di lettura di una serie. */
export type ReadingStatus = (typeof READING_STATUSES)[number];

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
  sourceHost: string;
}
