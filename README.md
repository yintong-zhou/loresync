# Loresync

Web platform for keeping track of manga, manhwa and manhua read online. The user
enters a link and the chapter they reached through a form; the system extracts
the title from the link automatically. See [PROJECT.md](PROJECT.md) for scope,
goals and milestones.

## Stack

- **Frontend + backend**: Next.js 16 (App Router) + React 19 + Tailwind CSS
- **Database and authentication**: Supabase (Postgres + Auth, with per-user RLS)
- **Validation**: Zod, shared between forms and route handlers
- **Languages**: Italian and English, `/[locale]` segment with no external dependencies

The APIs live in Next.js route handlers: there is no separate backend service.

## Structure

```
loresync/
├── frontend/                 # Next.js app (UI + API routes)
│   ├── app/
│   │   ├── [locale]/         # Root layout: every page lives under a language
│   │   │   ├── page.tsx      # Public landing page
│   │   │   ├── (auth)/login/ # Login / sign-up
│   │   │   ├── (app)/library/    # The user's library
│   │   │   └── (app)/manga/add/  # Entry form
│   │   └── api/              # Not localized: they return statuses, not redirects
│   │       ├── manga/        # CRUD for followed series
│   │       └── metadata/     # Title/description extraction from the link
│   ├── components/           # React components (ui/ generic, manga/ domain)
│   ├── lib/
│   │   ├── i18n/             # Languages, negotiation and dictionaries
│   │   ├── supabase/         # Browser, server and proxy clients
│   │   ├── validation/       # Zod schemas
│   │   └── types.ts          # Domain types
│   ├── proxy.ts              # Session refresh + route guard (formerly middleware)
│   └── public/               # Static assets
├── supabase/migrations/      # Versioned SQL schema
├── directives/               # SOPs in Markdown (level 1)
├── execution/                # Deterministic Python scripts (level 3)
└── .tmp/                     # Intermediate files, never committed
```

## Setup

```bash
cd frontend
cp .env.example .env.local   # Next reads env vars from this folder
npm install
npm run dev
```

The required variables are documented in
[frontend/.env.example](frontend/.env.example).
The database schema is applied with the Supabase CLI:

```bash
supabase db push
```

## Languages

Italian and English, with no i18n libraries: two languages and a `proxy.ts` that
already handles the session do not justify a second middleware to compose.

- Every page lives under `/[locale]`, and both languages are prerendered.
- `lib/i18n/dictionaries/it.ts` is the source of truth: `Dictionary` is derived
  from that object and `en.ts` is annotated with that type, so a missing or
  renamed key breaks the build instead of showing up once the page is open.
- The language is decided in `proxy.ts`: the `NEXT_LOCALE` cookie (explicit
  choice) takes precedence over the `Accept-Language` header, falling back to
  Italian. Visiting a localized page writes the cookie, so the selector does not
  touch client-side state.
- The `reading_status` enum values stay in Italian: they are data identifiers,
  not text. The translated labels live in the dictionaries.

To add a language: a new file in `lib/i18n/dictionaries/`, an entry in `LOCALES`,
and the rest (routing, prerendering, selector) follows on its own.

## Development note

`next build` and `next dev` share the `.next` folder: running them in parallel
corrupts the types generated in `.next/dev/types` and makes the typecheck fail
with syntax errors in files you never wrote. Stop the dev server before
building.

## Status

Scaffolding. Structure, configuration and database schema are in place;
authentication, the form, the library and metadata extraction are still to be
implemented.
