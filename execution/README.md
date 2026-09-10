# Execution

Script Python deterministici: il **Livello 3** dell'architettura (vedi `AGENT.md`).
Ogni script fa una cosa sola, e' invocabile da riga di comando, e legge le
credenziali da `.env` nella root del progetto.

## Convenzioni

- Nome in `snake_case.py`, verbo all'inizio (es. `extract_page_metadata.py`).
- Nessuno stato globale: input da argomenti CLI, output su stdout in JSON
  oppure su file in `.tmp/`.
- Exit code diverso da 0 in caso di errore, con messaggio su stderr.
- Ben commentati: chi legge lo script deve capire perche', non solo cosa.
- Prima di scriverne uno nuovo, controllare se ne esiste gia' uno adatto.

## Stato attuale

Nessuno script presente. L'estrazione dei metadata dai link è implementata
lato Next.js (`frontend/app/api/metadata/route.ts`), perché deve rispondere in
tempo reale a una richiesta dell'utente. Questa cartella resta per le utility
batch: reimport, bonifica dei titoli, backfill dei link ai capitoli.
