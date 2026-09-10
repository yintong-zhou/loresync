/** Stato di lettura di una serie. */
export type ReadingStatus = "in_corso" | "completato" | "in_pausa" | "droppato";

/** Etichette leggibili per lo stato di lettura. */
export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  in_corso: "In corso",
  completato: "Completato",
  in_pausa: "In pausa",
  droppato: "Droppato",
};

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
