/**
 * Parametri di tracciamento da rimuovere.
 * Non e' cosmesi: `series_url` fa parte della unique key
 * `(user_id, series_url)`, quindi lo stesso link con un `utm_source` diverso
 * entrerebbe in libreria come una seconda serie.
 */
const TRACKING_PARAMS = [
  /^utm_/i,
  /^ref$/i,
  /^referrer$/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^mc_(cid|eid)$/i,
  /^igshid$/i,
];

/** Vero solo per http e https: mai `javascript:`, `data:`, `file:`. */
export const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Normalizza un link prima di salvarlo o di scaricarlo.
 * Ritorna `null` se non e' un URL http(s) valido.
 */
export const normalizeUrl = (value: string): URL | null => {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  url.hostname = url.hostname.toLowerCase();
  url.hash = "";

  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.some((pattern) => pattern.test(key))) {
      url.searchParams.delete(key);
    }
  }

  return url;
};

/**
 * Legge il numero di capitolo da un link, quando c'e'.
 *
 * Serve in due punti: per suggerire `currentChapter` in fase di inserimento e
 * per capire se un `chapter_url` salvato e' rimasto indietro rispetto al
 * capitolo raggiunto (vedi `directives/resolve_chapter_url.md`).
 *
 * Ritorna `null` quando il capitolo non e' leggibile: slug testuali, id
 * opachi. `null` significa "non lo so", mai "capitolo 0".
 */
export const chapterFromUrl = (value: string): number | null => {
  let pathname: string;
  try {
    pathname = new URL(value).pathname;
  } catch {
    return null;
  }

  // `chapter-10-5`, `ch_10.5`, `capitolo/10`
  const labelled = pathname.match(
    /(?:chapter|chapitre|capitolo|capitulo|chap|ch|cap)[-_/.]?(\d+(?:[.-]\d+)?)/i,
  );

  // Ultimo segmento tutto numerico: `/serie/titolo/10.5`
  const trailing = pathname.match(/\/(\d+(?:\.\d+)?)\/?$/);

  const raw = labelled?.[1] ?? trailing?.[1];
  if (!raw) return null;

  // I siti scrivono i decimali sia `10.5` sia `10-5`: normalizzati entrambi.
  const parsed = Number.parseFloat(raw.replace("-", "."));
  return Number.isFinite(parsed) ? parsed : null;
};
