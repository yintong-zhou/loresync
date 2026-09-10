# Loresync

Piattaforma web per tenere traccia della lettura di manga, manhwa e manhua letti
online. L'utente inserisce link e capitolo raggiunto tramite un form; il sistema
estrae automaticamente il titolo dal link. Vedi [PROJECT.md](PROJECT.md) per
scope, obiettivi e milestone.

## Stack

- **Frontend + backend**: Next.js 16 (App Router) + React 19 + Tailwind CSS
- **Database e autenticazione**: Supabase (Postgres + Auth, con RLS per utente)
- **Validazione**: Zod, condivisa tra form e route handler
- **Lingue**: italiano e inglese, segmento `/[locale]` senza dipendenze esterne

Le API vivono nelle route handler di Next.js: non c'e' un servizio backend
separato.

## Struttura

```
loresync/
├── frontend/                 # App Next.js (UI + API routes)
│   ├── app/
│   │   ├── [locale]/         # Root layout: ogni pagina vive sotto una lingua
│   │   │   ├── page.tsx      # Landing pubblica di presentazione
│   │   │   ├── (auth)/login/ # Login / registrazione
│   │   │   ├── (app)/library/    # Libreria dell'utente
│   │   │   └── (app)/manga/add/  # Form di inserimento
│   │   └── api/              # Non localizzate: rispondono status, non redirect
│   │       ├── manga/        # CRUD delle serie seguite
│   │       └── metadata/     # Estrazione titolo/descrizione dal link
│   ├── components/           # Componenti React (ui/ generici, manga/ di dominio)
│   ├── lib/
│   │   ├── i18n/             # Lingue, negoziazione e dizionari
│   │   ├── supabase/         # Client browser, server e proxy
│   │   ├── validation/       # Schemi Zod
│   │   └── types.ts          # Tipi di dominio
│   ├── proxy.ts              # Refresh sessione + guardia rotte (ex middleware)
│   └── public/               # Asset statici
├── supabase/migrations/      # Schema SQL versionato
├── directives/               # SOP in Markdown (livello 1)
├── execution/                # Script Python deterministici (livello 3)
└── .tmp/                     # File intermedi, mai committati
```

## Setup

```bash
cd frontend
cp .env.example .env.local   # Next legge le env da questa cartella
npm install
npm run dev
```

Le variabili richieste sono documentate in
[frontend/.env.example](frontend/.env.example).
Lo schema del database si applica con la Supabase CLI:

```bash
supabase db push
```

## Lingue

Italiano e inglese, senza librerie di i18n: due lingue e un `proxy.ts` che gia'
gestisce la sessione non giustificano un secondo middleware da comporre.

- Ogni pagina vive sotto `/[locale]`, entrambe le lingue sono prerenderizzate.
- `lib/i18n/dictionaries/it.ts` e' la fonte di verita': `Dictionary` deriva da
  quell'oggetto e `en.ts` e' annotato con quel tipo, quindi una chiave mancante
  o rinominata rompe la compilazione invece di comparire a pagina aperta.
- La lingua si decide in `proxy.ts`: cookie `NEXT_LOCALE` (scelta esplicita)
  prima dell'header `Accept-Language`, con ripiego su italiano. Visitare una
  pagina localizzata scrive il cookie, quindi il selettore non tocca lo stato
  lato client.
- I valori dell'enum `reading_status` restano in italiano: sono identificativi
  di dati, non testo. Le etichette tradotte stanno nei dizionari.

Per aggiungere una lingua: nuovo file in `lib/i18n/dictionaries/`, voce in
`LOCALES`, e il resto (routing, prerender, selettore) segue da se'.

## Nota sullo sviluppo

`next build` e `next dev` condividono la cartella `.next`: lanciarli in
parallelo corrompe i tipi generati in `.next/dev/types` e fa fallire il
typecheck con errori di sintassi in file che non hai scritto. Ferma il dev
server prima di buildare.

## Stato

Scaffolding. Struttura, configurazione e schema del database sono in piedi;
autenticazione, form, libreria ed estrazione dei metadata sono ancora da
implementare.
