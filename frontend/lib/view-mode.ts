/**
 * Vista della libreria: elenco o griglia.
 *
 * Il meccanismo e' lo stesso della lingua (`lib/i18n/config.ts`): la scelta
 * viaggia nell'URL, il proxy la trasforma in cookie, e la volta dopo la pagina
 * riparte da li'. Cosi' il selettore resta due link e non ha bisogno ne' di
 * JavaScript ne' di scrivere cookie dal browser.
 */

/** Viste ammesse, nell'ordine in cui compaiono nel selettore. */
export const VIEW_MODES = ["list", "grid"] as const;

export type ViewMode = (typeof VIEW_MODES)[number];

/**
 * Elenco: e' la vista che mostra tutto e permette di modificare, quindi e'
 * quella giusta per chi arriva senza aver mai scelto.
 */
export const DEFAULT_VIEW_MODE: ViewMode = "list";

/** Nome del cookie. Il prefisso distingue i nostri da quelli di Supabase. */
export const VIEW_COOKIE = "loresync-view";

export const isViewMode = (value: string): value is ViewMode =>
  (VIEW_MODES as readonly string[]).includes(value);

/**
 * Decide quale vista mostrare.
 *
 * L'URL batte il cookie: un link condiviso deve aprirsi come l'ha lasciato chi
 * l'ha mandato, non come preferisce chi lo riceve. Il cookie serve solo quando
 * l'URL non dice niente, cioe' arrivando dal menu.
 */
export const resolveViewMode = (
  param: string | undefined,
  cookie: string | undefined,
): ViewMode => {
  if (param && isViewMode(param)) return param;
  if (cookie && isViewMode(cookie)) return cookie;
  return DEFAULT_VIEW_MODE;
};
