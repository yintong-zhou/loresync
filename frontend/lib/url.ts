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

/**
 * Legge un dominio scritto a mano: `manga.it`, `www.manga.it` o un link
 * intero incollato dalla barra degli indirizzi. Ritorna `null` se non e' un
 * dominio.
 */
export const hostFromInput = (value: string): string | null => {
  const raw = value.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return url.hostname.includes(".") ? url.hostname.toLowerCase() : null;
  } catch {
    return null;
  }
};

/**
 * Sposta un link da un dominio a un altro, lasciando intatto il resto:
 * `https://manga.it/serie/x` diventa `https://manga.com/serie/x`.
 * Ritorna `null` se il link non sta su `from`: corrispondenza esatta, quindi
 * `www.manga.it` e `cdn.manga.it` sono domini diversi da `manga.it`.
 */
export const swapHost = (
  value: string,
  from: string,
  to: string,
): string | null => {
  try {
    const url = new URL(value);
    if (url.hostname !== from) return null;
    url.hostname = to;
    return url.toString();
  } catch {
    return null;
  }
};

/**
 * Su quali siti stanno i link di una libreria, e quante serie per sito.
 * Ogni elemento di `series` sono i link di una serie (serie, capitolo,
 * copertina): una serie conta una volta sola per sito, anche se piu' link ci
 * puntano. Dal sito con piu' serie a quello con meno, poi in ordine alfabetico.
 */
export const countHosts = (
  series: (string | null)[][],
): { host: string; count: number }[] => {
  const counts = new Map<string, number>();
  for (const links of series) {
    const hosts = new Set<string>();
    for (const link of links) {
      if (!link) continue;
      try {
        hosts.add(new URL(link).hostname);
      } catch {
        // Link illeggibile: non sta su nessun sito.
      }
    }
    for (const host of hosts) counts.set(host, (counts.get(host) ?? 0) + 1);
  }
  return [...counts]
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count || a.host.localeCompare(b.host));
};
