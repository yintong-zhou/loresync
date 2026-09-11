import type { AuthError } from "@supabase/supabase-js";
import type { Dictionary } from "@/lib/i18n";
import { localizePath, splitLocale, type Locale } from "@/lib/i18n/config";

/**
 * Ripulisce il parametro `next` prima di usarlo come destinazione di redirect.
 *
 * `next` arriva dalla query string, quindi da chiunque sappia costruire un
 * link. Senza questo filtro `/it/login?next=https://esempio.invalid` renderebbe
 * il nostro login un trampolino verso un sito qualsiasi (open redirect), che e'
 * la base di mezza fenomenologia del phishing.
 *
 * Accetta solo path assoluti interni. Scarta gli URL assoluti, quelli
 * protocol-relative (`//host`) e i backslash, che alcuni browser normalizzano
 * in slash.
 */
export const safeNextPath = (next: string | null, locale: Locale): string => {
  // Senza un `next` valido si atterra in dashboard: e' la home dell'area
  // autenticata, quella che dice dov'eri arrivato.
  const fallback = localizePath(locale, "/dashboard");

  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.includes("\\")) return fallback;

  // Il `next` puo' arrivare con la lingua di partenza: vince quella corrente,
  // altrimenti cambiare lingua nel form di login non avrebbe effetto.
  const { rest } = splitLocale(next);
  return localizePath(locale, rest);
};

/**
 * Traduce un errore di Supabase Auth in un messaggio per l'utente.
 *
 * I codici non vengono mostrati mai: `invalid_credentials` diventa lo stesso
 * messaggio sia che l'email non esista sia che la password sia sbagliata, per
 * non trasformare il login in un modo per scoprire quali indirizzi sono
 * registrati.
 */
export const authErrorMessage = (
  error: AuthError,
  dict: Dictionary,
): string => {
  const errors = dict.auth.errors;

  switch (error.code) {
    case "invalid_credentials":
    case "email_not_confirmed":
      return errors.invalidCredentials;
    case "user_already_exists":
    case "email_exists":
      return errors.emailTaken;
    case "weak_password":
      return errors.weakPassword;
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return errors.rateLimited;
    case "same_password":
      return errors.samePassword;
    default:
      return errors.generic;
  }
};
