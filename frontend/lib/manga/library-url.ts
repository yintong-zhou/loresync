import { localizePath, type Locale } from "@/lib/i18n/config";
import { DEFAULT_SORT } from "@/lib/manga/sort";

/**
 * Stato della libreria leggibile dall'URL: filtri, ordinamento, vista e
 * pagina. E' quello che i link della pagina devono riportare per intero,
 * altrimenti cambiare vista azzererebbe i filtri o cambiare pagina
 * l'ordinamento.
 */
export type LibraryParams = {
  q?: string;
  status?: string;
  tag?: string;
  sort?: string;
  view?: string;
  adult?: string;
  page?: number;
};

/**
 * Costruisce un link alla libreria.
 *
 * I valori di default restano fuori dalla querystring: l'URL della prima
 * pagina ordinata come al solito e' quello nudo, e i link condivisi non
 * portano dietro parametri che non dicono niente.
 */
export const libraryHref = (locale: Locale, params: LibraryParams): string => {
  const search = new URLSearchParams();

  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.status) search.set("status", params.status);
  if (params.tag?.trim()) search.set("tag", params.tag.trim());
  if (params.sort && params.sort !== DEFAULT_SORT) search.set("sort", params.sort);
  if (params.view) search.set("view", params.view);
  // Sempre scritto, anche quando vale il default, al contrario di `sort` e
  // `page`: la scelta e' ricordata in un cookie, e un link che la omette non
  // dice "mostra tutto" ma "vale quel che c'era prima". Omettendola, il
  // pulsante non sarebbe piu' riuscito a riaccendere cio' che ha spento.
  if (params.adult) search.set("adult", params.adult);
  if (params.page && params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  const path = localizePath(locale, "/library");

  return query ? `${path}?${query}` : path;
};
