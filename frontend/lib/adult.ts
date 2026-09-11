/**
 * Contenuti per adulti: visibili o nascosti.
 *
 * Stesso meccanismo della vista (`lib/view-mode.ts`): la scelta viaggia
 * nell'URL, il proxy la trasforma in cookie, e la volta dopo la libreria
 * riparte da li'. Cosi' il comando resta un link — niente JavaScript, niente
 * cookie scritti dal browser — e chi nasconde questi contenuti li ritrova
 * nascosti al rientro, che e' l'unico modo in cui un interruttore del genere
 * serve davvero a qualcosa.
 *
 * Non e' un controllo parentale: il filtro guarda il tag, e il tag lo mette
 * chi inserisce la serie. Serve a non avere certe copertine sullo schermo
 * quando c'e' qualcuno alle spalle, non a impedire di vederle.
 */

/** Il tag che marca una serie come per adulti. */
export const ADULT_TAG = "adult";

export const ADULT_MODES = ["show", "hide"] as const;

export type AdultMode = (typeof ADULT_MODES)[number];

/**
 * Di norma si vede tutto: nascondere e' una scelta esplicita, e una libreria
 * che parte filtrata farebbe cercare serie che sembrano sparite.
 */
export const DEFAULT_ADULT_MODE: AdultMode = "show";

/** Nome del cookie. Il prefisso distingue i nostri da quelli di Supabase. */
export const ADULT_COOKIE = "loresync-adult";

export const isAdultMode = (value: string): value is AdultMode =>
  (ADULT_MODES as readonly string[]).includes(value);

/**
 * L'URL batte il cookie, come per la vista: un link condiviso si apre come
 * l'ha lasciato chi l'ha mandato.
 */
export const resolveAdultMode = (
  param: string | undefined,
  cookie: string | undefined,
): AdultMode => {
  if (param && isAdultMode(param)) return param;
  if (cookie && isAdultMode(cookie)) return cookie;
  return DEFAULT_ADULT_MODE;
};
