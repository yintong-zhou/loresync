import { ADULT_TAG } from "@/lib/adult";
import type { MangaEntry, ReadingStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SORT, SORT_COLUMNS, type SortKey } from "@/lib/manga/sort";

/** Riga come arriva da Postgres. */
type Row = {
  id: string;
  user_id: string;
  series_url: string;
  chapter_url: string | null;
  title: string;
  description: string | null;
  cover_url: string | null;
  current_chapter: string | number | null;
  status: ReadingStatus;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

const toEntry = (row: Row): MangaEntry => ({
  id: row.id,
  userId: row.user_id,
  seriesUrl: row.series_url,
  chapterUrl: row.chapter_url,
  title: row.title,
  description: row.description,
  coverUrl: row.cover_url,
  // `numeric` torna come stringa dal driver: convertito qui una volta sola,
  // cosi' il resto dell'app lavora sempre con un numero.
  currentChapter:
    row.current_chapter === null ? null : Number(row.current_chapter),
  status: row.status,
  tags: row.tags ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Quante serie per pagina.
 *
 * Divisibile per due, tre e quattro: sono le colonne che la griglia forma
 * mano a mano che lo schermo cresce, e cosi' l'ultima riga resta piena su
 * quasi tutte le larghezze.
 */
export const LIBRARY_PAGE_SIZE = 24;

export type LibraryFilters = {
  search?: string;
  status?: ReadingStatus | null;
  tag?: string | null;
  /** Tiene fuori le serie marcate col tag per adulti. */
  hideAdult?: boolean;
};

export type LibraryQuery = LibraryFilters & {
  sort?: SortKey;
  /** Pagina richiesta, a partire da 1. Fuori intervallo viene riportata dentro. */
  page?: number;
};

export type LibraryData = {
  entries: MangaEntry[];
  /** Tutti i tag dell'utente, per costruire i filtri. */
  allTags: string[];
  /** Totale senza filtri: distingue "libreria vuota" da "filtro senza esiti". */
  totalCount: number;
  /** Quante serie soddisfano i filtri, non quante ne mostra questa pagina. */
  filteredCount: number;
  /** Pagina effettivamente mostrata, gia' riportata dentro l'intervallo. */
  page: number;
  pageCount: number;
};

type Client = Awaited<ReturnType<typeof createClient>>;

/**
 * Applica i filtri una volta sola, perche' servono identici due volte: prima
 * per contare, poi per leggere la pagina. Scriverli due volte vorrebbe dire
 * che un domani ne resti indietro uno, e il conteggio non corrisponderebbe
 * piu' alle righe mostrate.
 *
 * Nessun `user_id` esplicito nella where: la RLS lo impone, e passarlo qui
 * darebbe la falsa impressione che sia quello a proteggere i dati.
 */
const filteredQuery = (
  supabase: Client,
  filters: LibraryFilters,
  options?: { count?: "exact"; head?: boolean },
) => {
  let query = supabase.from("manga_entries").select("*", options);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.tag) query = query.contains("tags", [filters.tag]);

  // `tags` e' `not null default '{}'`, quindi qui la negazione si puo'
  // scrivere secca: su una colonna che ammette NULL avrebbe scartato anche le
  // righe senza tag, perche' `not(NULL contiene X)` non e' vero, e' ignoto.
  if (filters.hideAdult) query = query.not("tags", "cs", `{${ADULT_TAG}}`);

  if (filters.search) {
    // `%` e `,` hanno un significato nella sintassi dei filtri PostgREST:
    // vanno neutralizzati o una ricerca per "100%" romperebbe la query.
    const term = filters.search.replace(/[%,()]/g, " ").trim();
    if (term) {
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  return query;
};

/**
 * Legge una pagina della libreria dell'utente autenticato.
 *
 * Il conteggio precede la lettura invece di arrivare insieme alle righe:
 * serve a sapere quante pagine esistono prima di chiederne una, cosi' una
 * pagina fuori intervallo si puo' riportare dentro invece di mostrare un
 * elenco vuoto senza spiegazione (e' cio' che tornerebbe: PostgREST a un
 * `range` oltre la fine risponde con zero righe, non con un errore).
 */
export const getLibrary = async (query: LibraryQuery): Promise<LibraryData> => {
  const supabase = await createClient();
  const { sort = DEFAULT_SORT, page: requestedPage = 1, ...filters } = query;

  const { count, error: countError } = await filteredQuery(supabase, filters, {
    count: "exact",
    head: true,
  });
  if (countError) throw new Error(countError.message);

  const filteredCount = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(filteredCount / LIBRARY_PAGE_SIZE));
  // Una pagina inventata a mano nell'URL, o l'ultima rimasta vuota dopo una
  // cancellazione, portano alla pagina piu' vicina che esiste invece che a un
  // elenco vuoto senza spiegazione.
  const page = Math.min(Math.max(1, Math.trunc(requestedPage) || 1), pageCount);
  const from = (page - 1) * LIBRARY_PAGE_SIZE;

  const { column, ascending } = SORT_COLUMNS[sort];

  const { data, error } = await filteredQuery(supabase, filters)
    .order(column, { ascending })
    // Secondo criterio a parita' di valore: senza, due serie con lo stesso
    // titolo o aggiornate nello stesso istante potrebbero scambiarsi di posto
    // fra una pagina e l'altra, comparendo due volte o sparendo.
    .order("id", { ascending: true })
    .range(from, from + LIBRARY_PAGE_SIZE - 1);

  if (error) throw new Error(error.message);

  const entries = (data as Row[]).map(toEntry);

  // I tag e il totale servono sempre completi: si contano a parte, altrimenti
  // filtrando per un tag sparirebbero tutti gli altri dai filtri.
  const { data: tagRows } = await supabase.from("manga_entries").select("tags");

  // Nascondendo i contenuti per adulti spariscono anche dai filtri: il tag
  // resterebbe selezionabile e darebbe un elenco vuoto, e il totale accanto al
  // contatore direbbe quante serie non stai vedendo.
  const rows = ((tagRows ?? []) as { tags: string[] | null }[]).filter(
    (row) => !query.hideAdult || !(row.tags ?? []).includes(ADULT_TAG),
  );

  const allTags = [
    ...new Set(rows.flatMap((row) => row.tags ?? [])),
  ].sort((a, b) => a.localeCompare(b));

  return {
    entries,
    allTags,
    totalCount: rows.length,
    filteredCount,
    page,
    pageCount,
  };
};
