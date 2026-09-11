/**
 * Ordinamento della libreria.
 *
 * Stesso meccanismo dei filtri: la scelta viaggia nella querystring, quindi un
 * elenco ordinato si puo' mettere fra i preferiti e la pagina resta servibile
 * senza JavaScript.
 *
 * Le chiavi sono nomi nostri e non nomi di colonna: l'URL non deve raccontare
 * com'e' fatta la tabella, e cambiare colonna sotto non deve rompere i link
 * gia' salvati da qualcuno.
 */

/**
 * Ordinamenti ammessi, nell'ordine in cui compaiono nella tendina: prima i due
 * per data, poi i due alfabetici. Ogni criterio ha entrambi i versi, perche'
 * una tendina che offre solo una direzione costringe a scorrere fino in fondo
 * per vedere l'altro capo dell'elenco.
 */
export const SORT_KEYS = ["recent", "oldest", "az", "za"] as const;

export type SortKey = (typeof SORT_KEYS)[number];

/**
 * Aggiornati per ultimi: chi apre la libreria vuole per prima cosa sapere dove
 * ha lasciato la lettura, ed e' l'ordine che c'era prima che la tendina
 * esistesse.
 */
export const DEFAULT_SORT: SortKey = "recent";

/**
 * Traduzione da chiave a colonna e verso.
 *
 * "Recente" e' l'ultimo aggiornamento, non la data di inserimento: conta
 * quando hai letto, non quando hai registrato la serie.
 */
export const SORT_COLUMNS: Record<
  SortKey,
  { column: string; ascending: boolean }
> = {
  recent: { column: "updated_at", ascending: false },
  oldest: { column: "updated_at", ascending: true },
  az: { column: "title", ascending: true },
  za: { column: "title", ascending: false },
};

export const isSortKey = (value: string): value is SortKey =>
  (SORT_KEYS as readonly string[]).includes(value);

/** Una chiave sconosciuta nell'URL non e' un errore: si torna al default. */
export const resolveSort = (param: string | undefined): SortKey =>
  param && isSortKey(param) ? param : DEFAULT_SORT;
