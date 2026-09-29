/**
 * Tema dell'interfaccia: chiaro, scuro, o quello del dispositivo.
 *
 * Stesso schema di `lib/adult.ts` e `lib/view-mode.ts` — un cookie, un
 * `resolve…` che ne legge il valore — con una differenza: qui non c'e' un
 * parametro nell'URL. Un tema non fa parte di cio' che un link condiviso deve
 * mostrare, e la scelta la scrive una server action, non il proxy.
 *
 * "Sistema" non e' un valore del cookie: e' il cookie che manca. Scegliere
 * "sistema" lo cancella, cosi' non esistono due modi di dire la stessa cosa.
 * Senza cookie decide `prefers-color-scheme`, dal CSS, senza JavaScript.
 *
 * Il file non importa niente, di proposito: cosi' i test lo eseguono con
 * `node --test` senza bisogno di Next.
 */

/** Modi ammessi, nell'ordine in cui il pulsante li attraversa. */
export const THEME_MODES = ["system", "light", "dark"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

/** Chi non ha mai scelto segue il dispositivo. */
export const DEFAULT_THEME_MODE: ThemeMode = "system";

/** Nome del cookie. Il prefisso distingue i nostri da quelli di Supabase. */
export const THEME_COOKIE = "loresync-theme";

export const isThemeMode = (value: string): value is ThemeMode =>
  (THEME_MODES as readonly string[]).includes(value);

/**
 * Il modo scelto, dal valore del cookie.
 *
 * Solo `light` e `dark` sono scelte scritte: qualunque altra cosa — assente,
 * scaduto, riscritto a mano — vale "sistema", mai un tema a caso.
 */
export const resolveTheme = (cookie: string | undefined): ThemeMode =>
  cookie === "light" || cookie === "dark" ? cookie : DEFAULT_THEME_MODE;

/** Il modo che il pulsante seleziona alla prossima pressione. */
export const nextTheme = (current: ThemeMode): ThemeMode =>
  THEME_MODES[(THEME_MODES.indexOf(current) + 1) % THEME_MODES.length];
