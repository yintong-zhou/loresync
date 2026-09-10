/** Lingue gestite. L'ordine e' quello di preferenza in fase di negoziazione. */
export const LOCALES = ["it", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** Lingua di ripiego quando la negoziazione non produce niente di utile. */
export const DEFAULT_LOCALE: Locale = "it";

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

/**
 * Estrae la lingua dal primo segmento del path.
 * `/en/library` -> { locale: "en", rest: "/library" }
 * `/library`    -> { locale: null, rest: "/library" }
 *
 * `rest` e' il path "logico", quello su cui ragionano le regole di
 * autenticazione: senza questa separazione ogni controllo su `/login` andrebbe
 * scritto una volta per lingua.
 */
export const splitLocale = (pathname: string) => {
  const [, first = "", ...others] = pathname.split("/");

  if (!isLocale(first)) {
    return { locale: null, rest: pathname };
  }

  return { locale: first, rest: `/${others.join("/")}` };
};

/** Compone un path localizzato: ("en", "/library") -> "/en/library". */
export const localizePath = (locale: Locale, rest: string) => {
  const clean = rest === "/" ? "" : rest;
  return `/${locale}${clean}`;
};

/**
 * Sceglie la lingua a partire dall'header Accept-Language.
 * Implementazione volutamente minima: con due lingue non serve un parser di
 * qualita' ponderata, basta la prima corrispondenza utile.
 */
export const negotiateLocale = (acceptLanguage: string | null): Locale => {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const tags = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter((tag): tag is string => Boolean(tag));

  for (const tag of tags) {
    // Confronta anche la sola sottoparte di lingua: `en-GB` vale `en`.
    const base = tag.split("-")[0] ?? "";
    if (isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
};

/** Nome del cookie che ricorda la scelta esplicita dell'utente. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Vero quando il segmento ha la forma di un codice lingua (`de`, `pt-br`),
 * gestito o no.
 *
 * Serve a distinguere due casi che il prefisso automatico confonderebbe:
 * `/library` e' un path da localizzare (-> `/it/library`), `/de/library` e' una
 * richiesta in una lingua che non gestiamo e deve dare 404, non finire in
 * `/it/de/library`. Conseguenza accettata: nessuna rotta dell'app puo' avere un
 * primo segmento di due lettere.
 */
export const looksLikeLocale = (segment: string) =>
  /^[a-z]{2}(-[a-z]{2,3})?$/i.test(segment);
