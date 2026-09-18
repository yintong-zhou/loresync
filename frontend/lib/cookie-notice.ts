/**
 * Presa d'atto dell'informativa sui cookie.
 *
 * Non e' un consenso, ed e' importante che il nome non lo suggerisca: i cookie
 * di questa applicazione sono tutti tecnici — la sessione e tre preferenze che
 * l'utente imposta cliccando un controllo — e per quelli l'obbligo e' informare,
 * non chiedere il permesso. La fascia serve a dire che esistono; questo cookie
 * ricorda che e' stata letta, cosi' non ricompare a ogni pagina.
 *
 * Va elencato nella cookie policy come tutti gli altri: una policy che non
 * dichiara il cookie con cui si chiude e' incompleta su se stessa.
 */

/** Nome del cookie. Il prefisso distingue i nostri da quelli di Supabase. */
export const NOTICE_COOKIE = "loresync-cookie-notice";

/**
 * Valore unico ammesso. Un valore fissato invece di un booleano qualsiasi:
 * cosi' un cookie manomesso o residuo di una versione precedente non conta
 * come presa d'atto, e la fascia ricompare invece di restare nascosta.
 */
export const NOTICE_ACK = "ack";

export const hasSeenNotice = (cookie: string | undefined): boolean =>
  cookie === NOTICE_ACK;
