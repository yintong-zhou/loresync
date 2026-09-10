import { chapterFromUrl, isHttpUrl } from "@/lib/url";

export type ReadingLink = {
  href: string;
  kind: "chapter" | "series";
  /** Vero quando si e' scartato un `chapterUrl` disallineato dal capitolo. */
  stale: boolean;
};

/**
 * Decide dove porta il pulsante "Riprendi lettura".
 * Implementa `directives/resolve_chapter_url.md`.
 *
 * Funzione pura: nessuna rete, nessun database. Non costruisce mai un URL di
 * capitolo per inferenza — vedere `chapter-12` non autorizza a generare
 * `chapter-13`, che darebbe un 404 con l'aria di funzionare.
 */
export const resolveReadingLink = (entry: {
  seriesUrl: string;
  chapterUrl: string | null;
  currentChapter: number | null;
}): ReadingLink | null => {
  const seriesOk = isHttpUrl(entry.seriesUrl);

  if (entry.chapterUrl && isHttpUrl(entry.chapterUrl)) {
    const linked = chapterFromUrl(entry.chapterUrl);

    // Confronto numerico e non testuale: `chapter-005` e `chapter-5` sono lo
    // stesso capitolo, e un confronto fra stringhe li direbbe diversi.
    const stale =
      linked !== null &&
      entry.currentChapter !== null &&
      linked !== entry.currentChapter;

    if (!stale) {
      return { href: entry.chapterUrl, kind: "chapter", stale: false };
    }

    // Link rimasto indietro: si torna alla pagina della serie. Riaprire il
    // capitolo vecchio sarebbe un errore silenzioso.
    if (seriesOk) {
      return { href: entry.seriesUrl, kind: "series", stale: true };
    }
  }

  if (seriesOk) return { href: entry.seriesUrl, kind: "series", stale: false };

  // Nessun target valido: il pulsante va disabilitato, non reso "alla meglio".
  return null;
};
