import { isPublicHost } from "./fetch-guard";
import { chapterFromUrl, normalizeUrl } from "@/lib/url";

/** Codici della tabella in `directives/extract_manga_metadata.md`. */
export type MetadataErrorCode =
  | "invalid_url"
  | "blocked_host"
  | "unsupported_content"
  | "fetch_failed"
  | "fetch_timeout"
  | "needs_manual";

export type MetadataResult =
  | {
      ok: true;
      title: string;
      description?: string;
      /** Link alla copertina pubblicata dal sito, gia' assoluto. */
      coverUrl?: string;
      sourceHost: string;
      /** Suggerimento, mai applicato in automatico. */
      chapterHint: number | null;
      canonicalUrl: string;
    }
  | { ok: false; code: MetadataErrorCode };

const MAX_BYTES = 512 * 1024;
const MAX_REDIRECTS = 2;

const DEFAULT_USER_AGENT = "LoresyncBot/0.1";

/** Entita' HTML che compaiono davvero nei titoli. */
const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

const decodeEntities = (value: string): string =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(Number.parseInt(dec, 10)),
    )
    .replace(/&([a-z]+);/gi, (match, name: string) => {
      const key = name.toLowerCase();
      return key in ENTITIES ? (ENTITIES[key] as string) : match;
    });

/**
 * Valore di un attributo HTML: fra virgolette doppie, singole, oppure nudo.
 *
 * Gli attributi senza virgolette sono HTML valido e in giro sono comuni, di
 * solito proprio sugli URL, che non contengono spazi: MangaWorld pubblica
 * `content=https://cdn.../cover.jpg`. Pretendere le virgolette faceva sparire
 * in silenzio copertina e descrizione su quei siti.
 */
const ATTRIBUTE =
  /([a-z_:][-a-z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+))/gi;

/**
 * Indicizza una volta sola tutti i meta della pagina: chiave (`property` o
 * `name`) -> `content`. Piu' economico di due regex per ogni chiave cercata, e
 * indifferente all'ordine degli attributi.
 */
const readMetaMap = (html: string): Map<string, string> => {
  const map = new Map<string, string>();

  for (const tag of html.matchAll(/<meta\s([^>]*?)\/?>/gi)) {
    const attrs = new Map<string, string>();

    for (const attr of (tag[1] ?? "").matchAll(ATTRIBUTE)) {
      const name = attr[1]?.toLowerCase();
      if (name) attrs.set(name, attr[2] ?? attr[3] ?? attr[4] ?? "");
    }

    const key = (attrs.get("property") ?? attrs.get("name"))?.toLowerCase();
    const content = attrs.get("content");

    // Vince la prima occorrenza: alcune pagine ripetono la stessa proprieta'
    // (og:type piu' volte, un tag per genere) e la prima e' quella buona.
    if (key && content && !map.has(key)) {
      map.set(key, decodeEntities(content.trim()));
    }
  }

  return map;
};

const readTag = (html: string, tag: string): string | null => {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match?.[1]) return null;
  // Un <h1> puo' contenere markup: via i tag, resta il testo.
  const text = decodeEntities(match[1].replace(/<[^>]+>/g, " ")).trim();
  return text || null;
};

/**
 * Ricava la copertina dalla pagina.
 *
 * `og:image` puo' essere relativo (`/cover.jpg`): va risolto contro l'URL
 * finale, altrimenti il browser lo cercherebbe sul nostro dominio. Il
 * risultato viene ammesso solo se http(s): finisce nell'attributo `src` di un
 * tag immagine.
 */
export const readCover = (html: string, base: URL): string | undefined => {
  const meta = readMetaMap(html);

  const candidate =
    meta.get("og:image:secure_url") ??
    meta.get("og:image") ??
    meta.get("twitter:image") ??
    // Anche qui href puo' essere senza virgolette.
    html.match(
      /<link[^>]*rel\s*=\s*["']?image_src["']?[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i,
    )?.slice(1).find(Boolean);

  if (!candidate) return undefined;

  try {
    const resolved = new URL(decodeEntities(candidate.trim()), base);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return undefined;
    }
    // Le URL sopra i 2000 caratteri sono quasi sempre data-uri travestite o
    // tracker: non vale la pena salvarle in colonna.
    const value = resolved.toString();
    return value.length <= 2000 ? value : undefined;
  } catch {
    return undefined;
  }
};

const BOILERPLATE = [
  /read manga online/i,
  /the best place to read/i,
  /free manga online/i,
  /leggi manga online/i,
];

/** Normalizzazione del titolo, punto 6 della direttiva. */
export const normalizeTitle = (raw: string, hostname: string): string => {
  let title = decodeEntities(raw).replace(/\s+/g, " ").trim();

  // Il nome del sito ricavato dall'host: `asuracomic.net` -> `asuracomic`.
  const brand = hostname.replace(/^www\./, "").split(".")[0] ?? "";

  // Suffisso del sito dopo l'ultimo separatore, rimosso solo se somiglia al
  // brand: molti titoli contengono un trattino legittimo.
  const separator = title.match(/^(.*)\s[-|–—»]\s([^-|–—»]+)$/);
  if (separator?.[1] && separator[2] && brand.length >= 3) {
    const tail = separator[2].toLowerCase().replace(/[^a-z0-9]/g, "");
    if (tail.includes(brand.toLowerCase()) || brand.toLowerCase().includes(tail)) {
      title = separator[1].trim();
    }
  }

  title = title
    .replace(/^read\s+/i, "")
    .replace(/\s*[-–|]?\s*manga online\s*$/i, "")
    .replace(/\s*[-–|]?\s*free manga\s*$/i, "")
    .replace(/\s*scan\s+vf\s*$/i, "");

  // La designazione di capitolo non fa parte del titolo della serie.
  title = title
    .replace(
      /\s*[-–|,:]?\s*(chapter|chapitre|capitolo|capitulo|chap|ch\.?|cap\.?)\s*\d+(?:[.-]\d+)?\s*$/i,
      "",
    )
    .replace(/\s*#\d+(?:[.-]\d+)?\s*$/, "");

  return title.replace(/\s+/g, " ").trim().slice(0, 300);
};

/** Scarica il corpo fermandosi al tetto: una pagina enorme non ci interessa. */
const readCapped = async (response: Response): Promise<string> => {
  const body = response.body;
  if (!body) return "";

  const reader = body.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let size = 0;

  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    chunks.push(decoder.decode(value, { stream: true }));
  }

  await reader.cancel().catch(() => undefined);
  return chunks.join("");
};

/**
 * Estrae titolo e descrizione dalla pagina indicata dal link.
 * Implementa `directives/extract_manga_metadata.md`.
 */
export const extractMetadata = async (
  rawUrl: string,
): Promise<MetadataResult> => {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) return { ok: false, code: "invalid_url" };

  const timeout = Number.parseInt(
    process.env.METADATA_FETCH_TIMEOUT_MS ?? "8000",
    10,
  );
  const userAgent = process.env.METADATA_FETCH_USER_AGENT ?? DEFAULT_USER_AGENT;

  let current = normalized;
  let response: Response | null = null;

  // Redirect seguiti a mano: ogni hop va ricontrollato, altrimenti un host
  // pubblico potrebbe rimbalzare su un indirizzo interno.
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!(await isPublicHost(current.hostname))) {
      return { ok: false, code: "blocked_host" };
    }

    try {
      response = await fetch(current, {
        redirect: "manual",
        headers: {
          "user-agent": userAgent,
          accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(Number.isFinite(timeout) ? timeout : 8000),
      });
    } catch (error) {
      const name = error instanceof Error ? error.name : "";
      return {
        ok: false,
        code: name === "TimeoutError" ? "fetch_timeout" : "fetch_failed",
      };
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return { ok: false, code: "fetch_failed" };

      const next = normalizeUrl(new URL(location, current).toString());
      if (!next) return { ok: false, code: "blocked_host" };
      current = next;
      response = null;
      continue;
    }

    break;
  }

  if (!response) return { ok: false, code: "fetch_failed" };

  // 403 e 503 sono il tipico blocco anti-bot: un tentativo, poi manuale.
  if (response.status === 403 || response.status === 503) {
    return { ok: false, code: "needs_manual" };
  }
  if (!response.ok) return { ok: false, code: "fetch_failed" };

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("html")) {
    return { ok: false, code: "unsupported_content" };
  }

  const html = await readCapped(response);

  const meta = readMetaMap(html);

  const candidate =
    meta.get("og:title") ??
    meta.get("twitter:title") ??
    readTag(html, "title") ??
    readTag(html, "h1");

  if (!candidate) return { ok: false, code: "needs_manual" };

  const title = normalizeTitle(candidate, current.hostname);
  if (!title) return { ok: false, code: "needs_manual" };

  const rawDescription =
    meta.get("og:description") ?? meta.get("description");

  const description =
    rawDescription &&
    rawDescription.length >= 40 &&
    rawDescription.length <= 2000 &&
    !BOILERPLATE.some((pattern) => pattern.test(rawDescription))
      ? rawDescription
      : undefined;

  return {
    ok: true,
    title,
    description,
    coverUrl: readCover(html, current),
    sourceHost: current.hostname,
    chapterHint: chapterFromUrl(current.toString()),
    canonicalUrl: current.toString(),
  };
};
