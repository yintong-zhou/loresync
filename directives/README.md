# Direttive

SOP in Markdown: il **Livello 1** dell'architettura (vedi `AGENT.md`). Una direttiva
descrive *cosa* fare, non *come* farlo in codice: obiettivo, input, tool/script da
usare, output atteso, casi limite.

## Convenzioni

- Un file per procedura, nome in `snake_case.md` (es. `extract_manga_metadata.md`).
- Ogni direttiva punta a uno o piu' script in `execution/`, mai a lavoro manuale.
- Sono documenti vivi: si aggiornano con i vincoli scoperti sul campo
  (limiti API, timing, formati inattesi, siti che bloccano i bot).
- Non vengono create o sovrascritte senza conferma esplicita.

## Template

Vedi `_template.md`.

## Direttive di Loresync

- `extract_manga_metadata.md` — estrazione di titolo/descrizione da un link.
  Attiva; tabella degli override per host mantenuta dall'utente, ora vuota.
- `resolve_chapter_url.md` — target del pulsante "Riprendi lettura": capitolo
  quando disponibile, altrimenti pagina della serie. Attiva; tabella dei
  template per host mantenuta dall'utente, ora vuota.

Entrambe funzionano a tabella vuota: gli override sono un miglioramento, non un
prerequisito.
