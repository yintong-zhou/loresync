import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  splitLocale,
  type Locale,
} from "@/lib/i18n/config";

/** Ricava la lingua dal path di una pagina, sia esso relativo o assoluto. */
const localeOf = (value: string | null): Locale | null => {
  if (!value) return null;

  try {
    const pathname = value.startsWith("/")
      ? value
      : new URL(value).pathname;
    return splitLocale(pathname).locale;
  } catch {
    // Referer malformato o assente: non e' un errore, si passa oltre.
    return null;
  }
};

/**
 * La lingua in cui e' scritta la pagina da cui arriva la richiesta.
 *
 * Serve alle server action, che devono sapere in che lingua rispondere e verso
 * quale path redirigere. Prima veniva spedita dal browser, con un campo
 * nascosto `locale` ripetuto in ogni form: sette copie della stessa riga, e un
 * form nuovo che se la dimenticava rispondeva in italiano senza dire niente.
 *
 * Qui invece la si deduce, in quest'ordine:
 *
 * 1. `Next-Url`, l'intestazione che Next manda con ogni server action e che
 *    contiene il path della pagina che l'ha invocata;
 * 2. il `Referer`, quando la prima manca — per esempio in un form inviato da
 *    un browser senza JavaScript;
 * 3. il cookie della lingua, scritto dal proxy a ogni visita.
 *
 * L'ordine non e' casuale: le prime due dicono da **quale pagina** si sta
 * scrivendo, il cookie dice soltanto qual e' stata l'ultima pagina visitata.
 * Con due schede aperte in due lingue diverse sarebbero risposte diverse, e
 * quella giusta e' la prima.
 */
export const getLocale = async (): Promise<Locale> => {
  const headerList = await headers();

  const fromPage =
    localeOf(headerList.get("next-url")) ?? localeOf(headerList.get("referer"));
  if (fromPage) return fromPage;

  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  return saved && isLocale(saved) ? saved : DEFAULT_LOCALE;
};
