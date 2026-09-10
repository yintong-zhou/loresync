import type { MangaEntry, ReadingStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

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

export type LibraryFilters = {
  search?: string;
  status?: ReadingStatus | null;
  tag?: string | null;
};

export type LibraryData = {
  entries: MangaEntry[];
  /** Tutti i tag dell'utente, per costruire i filtri. */
  allTags: string[];
  /** Totale senza filtri: distingue "libreria vuota" da "filtro senza esiti". */
  totalCount: number;
};

/**
 * Legge la libreria dell'utente autenticato.
 * Nessun `user_id` esplicito nella where: la RLS lo impone, e passarlo qui
 * darebbe la falsa impressione che sia quello a proteggere i dati.
 */
export const getLibrary = async (
  filters: LibraryFilters,
): Promise<LibraryData> => {
  const supabase = await createClient();

  let query = supabase
    .from("manga_entries")
    .select("*")
    .order("updated_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.tag) query = query.contains("tags", [filters.tag]);

  if (filters.search) {
    // `%` e `,` hanno un significato nella sintassi dei filtri PostgREST:
    // vanno neutralizzati o una ricerca per "100%" romperebbe la query.
    const term = filters.search.replace(/[%,()]/g, " ").trim();
    if (term) {
      query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const entries = (data as Row[]).map(toEntry);

  // I tag e il totale servono sempre completi: si contano a parte, altrimenti
  // filtrando per un tag sparirebbero tutti gli altri dai filtri.
  const { data: tagRows } = await supabase
    .from("manga_entries")
    .select("tags");

  const allTags = [
    ...new Set(
      ((tagRows ?? []) as { tags: string[] | null }[]).flatMap(
        (row) => row.tags ?? [],
      ),
    ),
  ].sort((a, b) => a.localeCompare(b));

  return { entries, allTags, totalCount: (tagRows ?? []).length };
};
