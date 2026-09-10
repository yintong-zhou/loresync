---
type: handoff
date: 2026-09-10
status: in-corso
seq: 1
prev: nessuno
tags: [scaffold, next16, supabase, brand, i18n, landing]
---

# Obiettivo

Costruire Loresync: piattaforma web per tenere traccia della lettura di manga,
manhwa e manhua letti online (vedi `PROJECT.md`). L'utente incolla link +
capitolo, il sistema ricava il titolo dal link, e il pulsante "Riprendi lettura"
riporta al punto giusto. Strumento personale per l'utente e un piccolo gruppo di
amici, ognuno con la propria lista. Scadenza dichiarata: MVP funzionante entro
poche settimane.

# A che punto siamo

**Funziona e verificato:**

- Scaffolding completo secondo `AGENT.md` (livelli direttive / esecuzione).
- Landing pubblica di presentazione in `/[locale]`, verificata nel browser su
  entrambe le lingue.
- Sistema multilingua italiano/inglese: 8 pagine prerenderizzate (SSG),
  negoziazione lingua, cookie, guardia auth per lingua, tutti i casi provati
  con curl.
- `proxy.ts` (ex middleware) che rinfresca la sessione Supabase, decide la
  lingua e protegge le rotte.
- Client Supabase browser/server/proxy scritti e tipizzati.
- `typecheck`, `lint` e `build` puliti. Zero vulnerabilita' npm.
- Due direttive scritte: `extract_manga_metadata.md`, `resolve_chapter_url.md`.

**A meta':**

- Le pagine `/login`, `/library`, `/manga/add` esistono, sono localizzate e
  raggiungibili, ma sono solo scheletri con testo segnaposto.
- `app/api/manga/route.ts` e `app/api/metadata/route.ts` rispondono `501`.

**Non iniziato:**

- Lo schema SQL `supabase/migrations/0001_init.sql` e' scritto ma **non e' mai
  stato applicato** al progetto Supabase.
- Autenticazione: nessun form, nessun flusso di sessione reale.
- `lib/reading-link.ts` (previsto da `resolve_chapter_url.md`) non esiste.
- Nessuno script in `execution/`.

# Cosa abbiamo provato che NON ha funzionato

- **Next.js 14 + eslintrc classico.** Scelta iniziale mia. `npm audit` dava 5
  vulnerabilita', una critica (RCE non autenticata su server Windows,
  GHSA-p293-qw3h-jr36). Abbandonato: aggiornato a Next 16 / React 19 / ESLint 9.
  Non tornare indietro.
- **`next lint`.** Rimosso dalla CLI in Next 16: lo script `"lint": "next lint"`
  era semplicemente rotto. Ora e' `eslint .` con flat config.
- **`.eslintrc.json`.** ESLint 9 non lo legge per default. Sostituito da
  `eslint.config.mjs`; `eslint-config-next` 16 esporta un array, non un oggetto
  con `extends`.
- **Snippet middleware del quickstart Supabase.** Creava il client e non lo usava
  mai: senza `getUser()` non rinfresca niente, nonostante il commento in
  `server.ts` dica il contrario. Riscritto come `updateSession` con `getUser()`.
- **`utils/supabase/*`** (percorsi del quickstart). Scartato: le direttive e le
  route referenziano gia' `lib/supabase/*`, un secondo albero sarebbe un
  doppione.
- **`.env.example` nella root del repo.** Next legge le env dalla root dell'app:
  li' non venivano caricate. Spostato in `frontend/`.
- **`next-intl`.** Valutato e scartato: porta un proprio middleware da comporre
  con `proxy.ts`, e per due lingue la negoziazione a mano sono venti righe.
- **Prefisso di lingua cieco nel proxy.** `/de/library` diventava
  `/it/de/library` e poi 404. Corretto con `looksLikeLocale`.
- **Tema "Minimal" (Sora + Work Sans, indaco, raggio 4-8px).** Costruito sulla
  prima versione di `brand-guidelines.md`, poi riscritta dall'utente. Buttato.
- **`line-height: 0.9` sull'h1 della landing.** L'accento di "PIU'" sfondava
  nella riga sopra. Hero portato a `leading-none`.
- **Avviare un secondo `next dev`.** Next 16 rifiuta un secondo dev server sulla
  stessa cartella. Vedi sotto.

# Problemi incontrati e come li abbiamo risolti

- **`typecheck` rosso su file mai scritti da noi.**
  Sintomo: errori di sintassi (`TS1128`, `TS1434`) in `.next/dev/types/validator.ts`
  e `root-params.d.ts`, con righe troncate tipo `cale]/layout.tsx`.
  Causa: `next build` e `next dev` condividono la cartella `.next`, e
  `tsconfig.json` (modificato da Next stesso) include `.next/dev/types/**/*.ts`
  nel typecheck; il dev server li riscrive mentre `tsc` li legge.
  Correzione: fermare il dev server, `rm -rf .next`, poi buildare. Ricapitera'.

- **Callback dei cookie Supabase non compilano con `strict: true`.**
  Sintomo: 10 errori `TS7006`/`TS7031` sui parametri di `setAll`.
  Causa: in `@supabase/ssr` 0.5.2 l'opzione `cookies` e' un'unione di due
  interfacce (API nuova e deprecata) e il contextual typing non attraversa le
  unioni.
  Correzione: `type CookiesToSet = Parameters<SetAllCookies>[0]`, derivato
  dall'export della libreria invece di riscritto a mano.

- **La landing era irraggiungibile.**
  Sintomo: `/` rimandava a `/login` anche per chi non ha un account.
  Causa: il proxy considerava pubblica solo `/login`.
  Correzione: `/` aggiunta alle rotte pubbliche (ora `rest === "/"`).

- **`middleware` deprecato in Next 16.**
  Sintomo: warning al build, "use proxy instead".
  Correzione: rinominati `middleware.ts` -> `proxy.ts` e
  `lib/supabase/middleware.ts` -> `lib/supabase/proxy.ts`, con export nominato
  `proxy`. Verificato nel template interno di Next:
  `(isProxy ? mod.proxy : mod.middleware) || mod.default`.

- **Due commit con lo stesso messaggio, uno con la mail di lavoro.**
  Correzione: riscritti con `git commit-tree` preservando i tree e le date
  d'autore; identita' `zhouyintong96@gmail.com` impostata **solo** su questo
  repo (`--local`), la globale resta `y.zhou@sirti.it`. Backup sul tag
  `backup/pre-fix-commits`.

# Decisioni prese

- **Next.js con API routes, non FastAPI.** `AGENT.md` prescriveva Next + FastAPI,
  `PROJECT.md` React + Node + Supabase. Unificato su Next: copre React e Node
  senza un secondo servizio Python. Nessuna cartella `backend/`.
- **Next 16 / React 19 / ESLint 9**, contro il restare su Next 14: advisory
  critico, e con 7 route banali la migrazione costava mezz'ora.
- **i18n fatto a mano**, contro `next-intl`: evita di comporre due middleware.
  Se in futuro servissero pluralizzazione, formati di data o interpolazione
  complessa, la libreria diventa giustificata.
- **`it.ts` come fonte di verita' dei dizionari**, con `en.ts` annotato
  `: Dictionary`: una chiave mancante rompe la compilazione invece di comparire
  come stringa vuota a pagina aperta.
- **Cookie prima di `Accept-Language`** nella scelta lingua: negoziando per
  primo, la scelta esplicita verrebbe sovrascritta a ogni visita.
- **Valori dell'enum `reading_status` lasciati in italiano** (`in_corso`, ...):
  sono identificativi di dati, non testo. Le etichette tradotte stanno nei
  dizionari. Scartata l'alternativa di rinominare l'enum in inglese.
- **`borderRadius` sovrascritto, non esteso**, in `tailwind.config.ts`: le
  guideline impongono 0px e cosi' nessuna utility `rounded-*` puo' reintrodurre
  angoli per distrazione.
- **Nessun URL di capitolo costruito per inferenza** (`resolve_chapter_url.md`):
  un link inventato da' 404, peggio dell'assenza del link perche' il pulsante
  sembra funzionare.
- **Tabelle override delle direttive mantenute dall'utente**, non dedotte
  scaricando pagine di prova. Deciso su indicazione esplicita dell'utente.
- **Il fallback manuale del form e' non negoziabile**: nessun errore di
  estrazione metadata puo' impedire di aggiungere una serie.
- **Il numero di capitolo estratto dal link non compila `currentChapter`**: e'
  solo un suggerimento. Chi copia il link del capitolo 40 puo' essere arrivato
  al 38.

# File toccati

- `README.md` — stack, struttura, setup, sezioni Lingue e Nota sullo sviluppo.
- `.gitignore` — `.tmp/`, env, `*.tsbuildinfo`, credenziali.
- `.claude/launch.json` — dev server con `autoPort`.
- `directives/README.md`, `directives/_template.md` — convenzioni livello 1.
- `directives/extract_manga_metadata.md` — SOP estrazione titolo/descrizione,
  guardrail SSRF, tabella errori, fallback manuale.
- `directives/resolve_chapter_url.md` — SOP target "Riprendi lettura", regola
  contro i link inferiti, gestione link stantio.
- `execution/README.md` — convenzioni livello 3 (cartella ancora vuota).
- `supabase/migrations/0001_init.sql` — `manga_entries`, enum, indice GIN sui
  tag, trigger `updated_at`, 4 policy RLS. **Non applicato.**
- `frontend/package.json`, `tsconfig.json`, `eslint.config.mjs`,
  `postcss.config.mjs` — Next 16, flat config, `lint` = `eslint .`.
- `frontend/tailwind.config.ts`, `app/globals.css` — token del brand Bold.
- `frontend/app/[locale]/layout.tsx` — root layout, font Anton/Barlow,
  `generateStaticParams`, metadata con `alternates`.
- `frontend/app/[locale]/page.tsx` — landing di presentazione.
- `frontend/app/[locale]/(auth)/login/page.tsx`,
  `(app)/layout.tsx`, `(app)/library/page.tsx`, `(app)/manga/add/page.tsx` —
  scheletri localizzati.
- `frontend/app/api/{manga,metadata}/route.ts` — stub `501`.
- `frontend/lib/i18n/{config.ts,index.ts,dictionaries/{it,en}.ts}` — i18n.
- `frontend/lib/supabase/{client,server,proxy}.ts` — client e refresh sessione.
- `frontend/proxy.ts` — export `proxy` + matcher.
- `frontend/components/ui/locale-switcher.tsx` — selettore lingua.
- `frontend/lib/types.ts` — `READING_STATUSES`, `MangaEntry`.
- `frontend/lib/validation/manga.ts` — schemi Zod.
- `frontend/.env.example` (versionato) e `frontend/.env.local` (ignorato, con le
  chiavi Supabase reali del progetto `itkvmdoibvwsmqdgkrta`).

# Dove vogliamo andare

1. **Applicare lo schema su Supabase**: `supabase db push` (o eseguire
   `0001_init.sql` dalla dashboard). Verificare che l'enum, il trigger e le 4
   policy RLS siano attivi, e che una query senza sessione non restituisca
   righe.
2. **Implementare l'autenticazione**: form in
   `app/[locale]/(auth)/login/page.tsx` con Supabase Auth (email + password),
   server action o route di callback, logout nell'header di `(app)/layout.tsx`.
   Le stringhe vanno nei dizionari sotto `auth`, non scritte in pagina.
3. Verificare che il flusso completo funzioni: login -> redirect a
   `?next=` -> `/library` con `auth.uid()` valorizzato. Solo dopo ha senso
   implementare libreria e form di inserimento.

# Da sapere prima di toccare qualcosa

- **Non lanciare `next build` con `next dev` attivo.** Corrompe
  `.next/dev/types` e il typecheck fallisce con errori in file generati. Ferma
  il dev server, `rm -rf .next`, poi builda.
- **Il nome del brand e' LORESYNC**, confermato dall'utente. Il refuso in
  `brand-guidelines.md` (LORESYC, senza la N, in titolo e campo Name) e' stato
  corretto: non e' piu' una questione aperta.
- **`brand-guidelines.md` e' stato riscritto una volta a meta' lavoro**, cambiando
  mood, palette, font, raggio e regole di layout. Rileggerlo per intero prima di
  fidarsi di quello che si ricorda, non solo la sezione che serve.
- **Nessuna rotta puo' avere un primo segmento di due lettere**: il proxy lo
  interpreterebbe come codice lingua. Conseguenza accettata di `looksLikeLocale`.
- **Le API stanno fuori da `/[locale]`** e il proxy non le redirige: devono
  rispondere status, non 307. L'autorizzazione la fa ogni handler.
- **Usare `getUser()`, non `getSession()`**, per decidere un redirect: il secondo
  legge il cookie senza validarlo.
- **L'identita' git e' locale a questo repo** (`zhouyintong96@gmail.com`). Se si
  clona altrove va reimpostata, altrimenti si committa con la mail di lavoro.
- Esiste il tag `backup/pre-fix-commits` dalla riscrittura dei commit: si puo'
  cancellare quando non serve piu'.
- La porta 3000 era occupata da un `next dev` dell'utente. `.claude/launch.json`
  ha `autoPort: true`, quindi il preview prende una porta libera da solo.
