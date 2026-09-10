# Loresync

Piattaforma web per tenere traccia della lettura di manga, manhwa e manhua letti
online. L'utente inserisce link e capitolo raggiunto tramite un form; il sistema
estrae automaticamente il titolo dal link. Vedi [PROJECT.md](PROJECT.md) per
scope, obiettivi e milestone.

## Stack

- **Frontend + backend**: Next.js 14 (App Router) + React + Tailwind CSS
- **Database e autenticazione**: Supabase (Postgres + Auth, con RLS per utente)
- **Validazione**: Zod, condivisa tra form e route handler

Le API vivono nelle route handler di Next.js: non c'e' un servizio backend
separato.

## Struttura

```
loresync/
├── frontend/                 # App Next.js (UI + API routes)
│   ├── app/
│   │   ├── (auth)/login/     # Login / registrazione
│   │   ├── (app)/library/    # Libreria dell'utente
│   │   ├── (app)/manga/add/  # Form di inserimento
│   │   └── api/
│   │       ├── manga/        # CRUD delle serie seguite
│   │       └── metadata/     # Estrazione titolo/descrizione dal link
│   ├── components/           # Componenti React (ui/ generici, manga/ di dominio)
│   ├── lib/
│   │   ├── supabase/         # Client browser e server
│   │   ├── validation/       # Schemi Zod
│   │   └── types.ts          # Tipi di dominio
│   └── public/               # Asset statici
├── supabase/migrations/      # Schema SQL versionato
├── directives/               # SOP in Markdown (livello 1)
├── execution/                # Script Python deterministici (livello 3)
└── .tmp/                     # File intermedi, mai committati
```

## Setup

```bash
cp .env.example .env.local
cd frontend && npm install && npm run dev
```

Le variabili richieste sono documentate in [.env.example](.env.example).
Lo schema del database si applica con la Supabase CLI:

```bash
supabase db push
```

## Stato

Scaffolding. Struttura, configurazione e schema del database sono in piedi;
autenticazione, form, libreria ed estrazione dei metadata sono ancora da
implementare.
