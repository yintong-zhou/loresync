import { createClient } from "@/lib/supabase/server";
import type { Row } from "@/lib/manga/queries";
import { READING_STATUSES, type ReadingStatus } from "@/lib/types";

/**
 * Le colonne che servono agli aggregati, e solo quelle: titolo, descrizione,
 * copertina e link non entrano in nessun conteggio, e su una libreria grande
 * sono la parte grossa dei byte trasferiti.
 */
type StatsRow = Pick<Row, "status" | "current_chapter" | "updated_at">;

/** Finestre dell'attivita' recente, in giorni. */
export const RECENT_DAYS = [7, 30] as const;

export type DashboardData = {
  /** Serie in libreria. Tutte: la dashboard non filtra niente. */
  totalCount: number;
  /** Una voce per ogni stato, anche quando vale zero: la riga e' sempre intera. */
  byStatus: Record<ReadingStatus, number>;
  /**
   * Somma dell'ultimo capitolo raggiunto in ogni serie.
   *
   * Non e' un conteggio di capitoli letti, ed e' bene non chiamarlo cosi'
   * altrove: la tabella salva dove sei arrivato, non cosa hai aperto. Coincide
   * con i capitoli letti solo assumendo che ogni serie sia stata letta
   * dall'inizio, e sbaglia in entrambe le direzioni — per eccesso con chi si e'
   * unito a meta' storia, per difetto con le serie segnate completate senza
   * numero di capitolo, che qui valgono zero.
   *
   * Si tiene comunque, perche' e' il meglio che i dati permettono e l'ordine di
   * grandezza e' giusto. Quello che non si fa e' spacciarlo per esatto:
   * l'etichetta in pagina dice "raggiunti", non "letti".
   */
  chaptersRead: number;
  /** Serie aggiornate nelle ultime N giornate, per ogni N in `RECENT_DAYS`. */
  recent: Record<number, number>;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Ampiezza della finestra chiesta a ogni giro.
 *
 * Non e' il numero di righe che tornano: PostgREST ha un tetto suo, e puo'
 * risponderne di meno. Per questo il ciclo avanza di quante ne ha ricevute e
 * non di questo valore, altrimenti con un tetto piu' basso salterebbe righe
 * silenziosamente — che e' esattamente il difetto da cui nasce la lettura a
 * blocchi.
 */
const BATCH = 1000;

/**
 * Legge tutta la libreria dell'utente, a blocchi, e ne calcola gli aggregati.
 *
 * A blocchi e non in una volta sola perche' una `select` senza intervallo viene
 * troncata dal tetto righe di PostgREST, e la troncatura non si distingue da
 * una libreria piccola: i totali sarebbero parziali senza che niente lo dica.
 *
 * Gli aggregati si calcolano qui e non su Postgres: una `group by` per stato,
 * una `sum` e due `count` con finestre diverse sarebbero quattro andate e
 * ritorni, o una funzione da tenere allineata in una migration. E' la stessa
 * scelta gia' fatta da `getLibrary` per l'elenco dei tag.
 *
 * Nessun filtro sui contenuti per adulti: sono numeri, non copertine.
 * Nasconderli non eviterebbe nessuno sguardo di lato, e un totale che cala
 * quando si attiva il filtro descriverebbe male la libreria che si possiede.
 *
 * Nessun `user_id` nella where: lo impone la RLS. Scriverlo qui darebbe la
 * falsa impressione che sia questa riga a proteggere i dati.
 */
export const getDashboard = async (): Promise<DashboardData> => {
  const supabase = await createClient();

  const rows: StatsRow[] = [];

  for (let from = 0; ; ) {
    const { data, error } = await supabase
      .from("manga_entries")
      .select("status, current_chapter, updated_at")
      // Ordine stabile: senza, due blocchi consecutivi potrebbero restituire
      // la stessa riga o saltarne una, e la somma sarebbe sbagliata di poco —
      // il modo peggiore, perche' resta credibile.
      .order("id", { ascending: true })
      .range(from, from + BATCH - 1);

    if (error) throw new Error(error.message);

    const batch = (data ?? []) as StatsRow[];
    if (batch.length === 0) break;

    rows.push(...batch);
    from += batch.length;
  }

  // Tutti gli stati partono da zero: una riga che ne salta uno perche' nessuna
  // serie lo usa si leggerebbe come "quello stato non esiste".
  const byStatus = Object.fromEntries(
    READING_STATUSES.map((status) => [status, 0]),
  ) as Record<ReadingStatus, number>;

  const recent = Object.fromEntries(
    RECENT_DAYS.map((days) => [days, 0]),
  ) as Record<number, number>;

  // Un istante solo per tutte le righe: prendendolo dentro il ciclo, una
  // libreria grande potrebbe attraversare la mezzanotte a meta' conteggio.
  const now = Date.now();

  let chaptersRead = 0;

  for (const row of rows) {
    byStatus[row.status] += 1;

    // `numeric` torna come stringa dal driver. `Number(null)` sarebbe zero,
    // quindi il caso nullo va tolto prima, non sommato "tanto vale zero": qui
    // funzionerebbe, ma e' una coincidenza su cui non vale la pena appoggiarsi.
    if (row.current_chapter !== null) {
      const chapter = Number(row.current_chapter);
      if (Number.isFinite(chapter)) chaptersRead += chapter;
    }

    const updatedAt = Date.parse(row.updated_at);
    if (!Number.isNaN(updatedAt)) {
      for (const days of RECENT_DAYS) {
        if (now - updatedAt <= days * DAY_MS) recent[days] += 1;
      }
    }
  }

  return {
    totalCount: rows.length,
    byStatus,
    // I capitoli sono decimali (10.5): sommandone molti l'aritmetica in
    // virgola mobile lascia una coda di cifre che non significano niente.
    chaptersRead: Math.round(chaptersRead * 100) / 100,
    recent,
  };
};
