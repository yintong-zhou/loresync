/**
 * Limite di richieste per utente su `POST /api/metadata`, dalla sezione
 * "Rate limiting in uscita" di `directives/extract_manga_metadata.md`: senza,
 * chi importa venti serie di fila (o chi lo fa apposta, in parallelo) manda
 * raffiche di fetch verso lo stesso sito e il server si prende un ban IP.
 *
 * Il contatore vive nella memoria del processo. Su un deploy con piu' istanze
 * ciascuna conta per conto suo, quindi il tetto reale e' quello qui sotto
 * moltiplicato per le istanze attive: ferma le raffiche, non e' una quota
 * esatta. Per una quota condivisa servirebbe uno store comune.
 */

/** Richieste ammesse per utente nella finestra, dalla direttiva. */
const LIMIT = 10;
const WINDOW_MS = 60_000;

/** Timestamp delle richieste ammesse, per utente, dentro la finestra. */
const hits = new Map<string, number[]>();

export type RateLimitDecision =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Registra la richiesta se c'e' posto. Va chiamata prima di qualunque lavoro
 * di rete, DNS compreso: una richiesta respinta non deve costare nulla.
 */
export const takeMetadataSlot = (
  userId: string,
  now: number = Date.now(),
): RateLimitDecision => {
  const recent = (hits.get(userId) ?? []).filter(
    (time) => now - time < WINDOW_MS,
  );

  if (recent.length >= LIMIT) {
    hits.set(userId, recent);
    const oldest = recent[0] ?? now;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
    };
  }

  recent.push(now);
  hits.set(userId, recent);
  sweep(now);
  return { allowed: true };
};

let lastSweep = 0;

/** Toglie ogni tanto gli utenti inattivi, perche' la mappa non cresca e basta. */
const sweep = (now: number): void => {
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [userId, times] of hits) {
    if (times.every((time) => now - time >= WINDOW_MS)) hits.delete(userId);
  }
};
