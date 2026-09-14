<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="frontend/lib/img/logo-on-dark.png">
    <img src="frontend/lib/img/logo-on-light.png" width="360" alt="Loresync">
  </picture>
</p>

<p align="center">
  Keep track of the manga, manhwa and manhua you read online.
</p>

---

You paste a link and the chapter you reached. Loresync pulls the title, the
description and the cover from that link, and puts a **Resume reading** button
next to the series that takes you back where you left off.

It is a personal tool, built for one reader and a small group of friends: each
account has its own library, and nothing is shared between them. See
[PROJECT.md](PROJECT.md) for scope, goals and milestones.

## Features

- **Add a series from its link.** Title, description and cover are extracted
  from the page; every field stays editable, and a failed extraction never
  blocks the insert — the form falls back to manual entry.
- **Resume reading.** The button targets the chapter URL when the site's scheme
  makes it derivable, and the series page otherwise. Links are never guessed: an
  invented URL 404s while looking like it works.
- **Library.** List or grid view, search across title and description, filters
  by reading status and tag, inline chapter and status updates, sorting and
  pagination.
- **Dashboard.** Counts and breakdowns across the whole library.
- **Account.** Display name, preferred language, email and password changes, and
  account deletion.
- **Two languages.** Italian and English, prerendered, with the language
  negotiated per visitor.

## Stack

- **Frontend + backend**: Next.js 16 (App Router) + React 19 + Tailwind CSS
- **Database and authentication**: Supabase (Postgres + Auth, with per-user RLS)
- **Validation**: Zod, shared between forms and route handlers
- **Languages**: Italian and English, `/[locale]` segment with no external dependencies

The APIs live in Next.js route handlers: there is no separate backend service.
Writes go through server actions rather than a REST surface — a second road to
the same data would only be one more thing to validate.

## Structure

```
loresync/
├── frontend/                 # Next.js app (UI + API routes)
│   ├── app/
│   │   ├── [locale]/         # Root layout: every page lives under a language
│   │   │   ├── page.tsx           # Public landing page
│   │   │   ├── (auth)/login/      # Login / sign-up
│   │   │   ├── (app)/dashboard/   # Reading stats
│   │   │   ├── (app)/library/     # The user's library
│   │   │   ├── (app)/manga/add/   # Entry form
│   │   │   └── (app)/account/     # Profile, email, password, deletion
│   │   ├── api/metadata/     # Not localized: returns statuses, not redirects
│   │   └── auth/callback/    # Landing point for emailed links
│   ├── components/           # ui/ generic, the others by domain
│   ├── lib/
│   │   ├── auth/             # Sign in/up/out, redirect and error helpers
│   │   ├── manga/            # Server actions, queries, sorting, stats
│   │   ├── metadata/         # Extraction from the link + SSRF guard
│   │   ├── i18n/             # Languages, negotiation and dictionaries
│   │   ├── supabase/         # Browser, server and proxy clients
│   │   └── validation/       # Zod schemas
│   └── proxy.ts              # Session refresh + route guard (formerly middleware)
├── supabase/migrations/      # Versioned SQL schema
├── directives/               # SOPs in Markdown (level 1)
├── execution/                # Deterministic scripts (level 3, still empty)
└── .tmp/                     # Intermediate files, never committed
```

`directives/` and `execution/` are the first and third levels of the
architecture described in [AGENT.md](AGENT.md): procedures written in prose that
survive a change of model, and deterministic scripts that do not need one.

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

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `eslint .` |

> [!WARNING]
> `next build` and `next dev` share the `.next` folder: running them in parallel
> corrupts the types generated in `.next/dev/types` and makes the typecheck fail
> with syntax errors in files you never wrote. Stop the dev server before
> building.

### Confirmation emails

Supabase composes the confirmation emails (sign-up, email change, password
recovery) and generates their tokens; delivery goes through Resend's SMTP server
instead of Supabase's built-in sender, which is capped at a couple of messages
per hour. Nothing about this lives in the app: no dependency, no env var read at
runtime. It is configured in the Supabase dashboard, under Authentication.

- **Email → Confirm email**: on.
- **Email → SMTP Settings**: host `smtp.resend.com`, port `465` (or `587` for
  STARTTLS), username `resend`, password = a Resend API key.
- **Email templates**: point every link at
  `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type={{ .Type }}`.
  The default templates use a browser-only flow that leaves no server-side
  cookie, so the link would land on a page with no session.
- **URL Configuration → Site URL**: must match `NEXT_PUBLIC_SITE_URL`, since
  `{{ .SiteURL }}` is what the templates above expand.
- **Rate Limits → Emails**: the built-in limit stays in force until a custom SMTP
  server is set; raise it once Resend is in place.

> [!IMPORTANT]
> With **Confirm email** off, Supabase confirms the address at sign-up and never
> generates an email at all — no SMTP setting can make one arrive. The API
> reports this as `mailer_autoconfirm: true` on `/auth/v1/settings`, which is the
> fastest way to check it from outside the dashboard.

> [!NOTE]
> Resend's `onboarding@resend.dev` sender needs no verified domain, but it only
> delivers to the address the Resend account is registered with. Anyone else's
> sign-up produces an email that is never delivered. Use a sender on a verified
> domain before opening registration to other people.

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

> [!NOTE]
> No route may have a two-letter first segment: `proxy.ts` would read it as a
> language code.

## Status

Usable end to end: authentication, account management, metadata extraction,
library and dashboard all work against a real Supabase project. Sorting,
filtering and pagination are in place.

Not done yet: deployment, and a verified Resend domain so confirmation emails
reach anyone other than the project owner.
