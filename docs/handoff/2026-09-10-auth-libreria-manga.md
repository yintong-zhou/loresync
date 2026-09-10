---
type: handoff
date: 2026-09-10
status: in corso
seq: 1
prev: docs/handoff/2026-09-10-scaffold-landing-i18n.md
tags: [loresync, supabase, auth, libreria, metadata, copertine]
---

# Obiettivo

Loresync tiene traccia di manga, manhwa e manhua letti online: incolli il link
e il capitolo, il sistema ricava il titolo, e quando torni sai da dove
riprendere. Strumento personale per l'utente e un piccolo gruppo di amici, ogni
lettore con la propria lista. Scope e vincoli stanno in `PROJECT.md`.

Questa sessione ha portato l'app dallo scaffolding a **funzionante**:
autenticazione, account, inserimento manga, libreria con ricerca e filtri.

# A che punto siamo

**Funziona, provato end-to-end contro il progetto Supabase reale:**

- Login, registrazione, logout. La conferma via email e' disattivata sul
  progetto, quindi la registrazione apre subito la sessione.
- Account: nome visualizzato, lingua preferita, cambio email, cambio password.
- Inserimento manga con estrazione automatica di titolo, descrizione e
  copertina dal link.
- Libreria: elenco con copertina 150x225, ricerca su titolo e descrizione,
  filtro per stato e per tag, aggiornamento di capitolo e stato in linea,
  pannello Modifica (link, tag, descrizione), eliminazione con conferma.
- Migration `0002_profiles.sql` e `0003_cover_url.sql` **applicate** dall'utente
  sul progetto `itkvmdoibvwsmqdgkrta`.

**Non iniziato:** ordinamento e paginazione della libreria, deploy.

**Non committato:** tutto. 13 file modificati, 19 nuovi.

# Cosa abbiamo provato che NON ha funzionato

- **Diagnosi sbagliata sulla copertina mancante.** Il primo sospetto e' stato
  un dev server con codice vecchio. Falso: il server era piu' recente dei file.
  La causa era un bug nel parser (sotto). Non ripartire da li'.
- **`pkill -f "next dev"` non uccide il dev server** in questo ambiente. Serve
  `Stop-Process -Id <pid>` da PowerShell, trovando il PID con
  `Get-NetTCPConnection -LocalPort 3000`.
- **`useEffect` + `setState` per chiudere il pannello Modifica**: respinto dal
  lint del React Compiler (`react-hooks/set-state-in-effect`), e comunque
  sbagliato nel merito perche' il pannello si vedeva aperto per un istante.
  Sostituito con l'aggiustamento in fase di render.
- **`next/image` per le copertine**: scartato. Richiede di elencare in anticipo
  gli host consentiti, ma le copertine arrivano da qualunque sito. Aprirlo a
  `**` avrebbe fatto scaricare al nostro server immagini da host arbitrari.
- **MCP Supabase per applicare le migration**: l'account connesso vede solo
  `ICPN_Main`, non il progetto di Loresync. Le migration le applica l'utente.
- **Import con alias `@/` negli script di test Node**: non risolvibili. Per
  testare un modulo si sostituisce temporaneamente l'alias con un percorso
  `file:///`, si lancia, e si ripristina subito.
- **Python non e' disponibile** su questa macchina (`D:`). Usare gli strumenti
  di modifica diretta o `sed`.

# Problemi incontrati e come li abbiamo risolti

- **Copertina e descrizione assenti su mangaworld.mx.** Causa: quel sito scrive
  gli attributi HTML senza virgolette (`content=https://...`), che e' HTML
  valido, e le regex pretendevano `"` o `'`. Su quel sito **nessun** meta tag
  veniva letto; il titolo arrivava dal tag `<title>`, quarto della cascata, e
  mascherava il guasto. Corretto con un parser di attributi che accetta
  virgolette doppie, singole o niente, e che indicizza tutti i meta in una
  mappa sola.
- **Typecheck rotto da file generati.** `next build` lanciato mentre `next dev`
  gira corrompe `.next/dev/types`, e `tsconfig.json` li include. Fermare il dev
  server, `rm -rf .next`, poi buildare.
- **Controlli disallineati.** Un pulsante con solo sfondo e un campo con
  `border-2` non hanno la stessa altezza: il bordo aggiunge 4px. Risolto dando
  a ogni controllo lo stesso bordo (anche i pieni, in tinta con lo sfondo) e
  un'altezza fissa.
- **Errori di tipo sui cookie di `@supabase/ssr`.** L'opzione `cookies` e'
  un'unione di due interfacce e il contextual typing non attraversa le unioni:
  i callback vanno annotati con `Parameters<SetAllCookies>[0]`.
- **`.env.local` mancante su `D:`** perche' ignorato da git. Ricreato con le
  chiavi Supabase; l'utente vi ha poi aggiunto `USERMAIL` e `PASSWORD` per
  permettere le verifiche end-to-end.

# Decisioni prese

- **CRUD via server action, non via `/api/manga`.** La route stub e' stata
  rimossa: una seconda strada per gli stessi dati sarebbe stata solo una
  superficie in piu' da validare.
- **`/api/metadata` richiede sessione.** Senza, era un downloader aperto
  utilizzabile per scaricare pagine a nome del server.
- **Copertina: si salva il link, non il file.** Nessun file da conservare,
  nessuna banda spesa a fare da tramite, nessun dubbio sui diritti. Scartato lo
  scaricamento su storage.
- **Un'unica azione per capitolo e stato** (`updateProgress`), muta. Scartati
  due form separati: nell'uso reale si aggiornano insieme.
- **`updateDetails` invece restituisce uno `FormState`**, perche' cambiare il
  link puo' violare il vincolo `(user_id, series_url)` e un fallimento
  silenzioso farebbe credere di aver salvato.
- **I campi facoltativi non si auto-compilano mai.** Regola dell'utente, vale
  per tutti i form. Il titolo, obbligatorio, resta l'unica eccezione. Nel
  pannello Modifica il campo descrizione vuoto significa "lasciala com'e'": per
  toglierla c'e' una casella dedicata, altrimenti sarebbe impossibile.
- **Nessun URL di capitolo costruito per inferenza**, come da direttiva. Un
  link inventato da 404 con l'aria di funzionare.
- **Enum `reading_status` in italiano**: sono identificativi di dati, non
  testo. Le etichette tradotte stanno nei dizionari.
- **Conferme senza JavaScript** (`<details>` a due click) per l'eliminazione.

# File toccati

**Nuovi**

- `supabase/migrations/0002_profiles.sql` — tabella `profiles`, RLS, trigger
  `handle_new_user` che crea il profilo alla registrazione.
- `supabase/migrations/0003_cover_url.sql` — colonna `cover_url` con vincolo
  sullo schema `^https?://`.
- `frontend/lib/auth/{actions,helpers}.ts` — `signIn`, `signUp`, `signOut`;
  `safeNextPath` contro l'open redirect, traduzione degli errori Supabase.
- `frontend/lib/manga/{actions,queries}.ts` — `createEntry`, `updateProgress`,
  `updateDetails`, `deleteEntry`; `getLibrary` con ricerca e filtri.
- `frontend/lib/metadata/{extract,fetch-guard}.ts` — estrazione metadata e
  guardrail SSRF.
- `frontend/lib/{url,reading-link,form-state}.ts` — normalizzazione URL e
  capitolo dal link; target di "Riprendi"; stato condiviso dei form.
- `frontend/lib/validation/{auth,profile}.ts`.
- `frontend/app/[locale]/(app)/account/` — pagina e azioni dell'account.
- `frontend/app/auth/callback/route.ts` — atterraggio dei link email.
- `frontend/components/{auth,account,manga,ui}/` — form e componenti.

**Modificati**

- `frontend/lib/supabase/proxy.ts` — `/auth` fuori dal prefisso di lingua.
- `frontend/lib/validation/manga.ts` — `mangaFormSchema`, `mangaEditSchema`,
  `parseTags`.
- `frontend/lib/types.ts` — `Profile`, `coverUrl` su `MangaEntry`.
- `frontend/app/[locale]/(app)/{library,manga/add}/page.tsx`,
  `(auth)/login/page.tsx`, `(app)/layout.tsx`.
- `frontend/app/api/metadata/route.ts` — implementata (era 501).
- `frontend/lib/i18n/dictionaries/{it,en}.ts` — sezioni `nav`, `auth`,
  `account`, `manga`, `library`.
- `brand-guidelines.md` — corretto il refuso LORESYC.

**Rimosso:** `frontend/app/api/manga/route.ts`.

# Dove vogliamo andare

1. **Committare tutto**, spezzato in commit sensati. Una traccia possibile:
   migration; autenticazione e account; estrazione metadata e copertine;
   inserimento e libreria; sistema dei controlli e compattamento della lista.
   Verificare prima che `npm run typecheck`, `npm run lint` e `npm run build`
   siano puliti a dev server fermo.
2. Decidere i **tag nel pannello Modifica**: applicare o no la regola dei campi
   facoltativi, stabilendo se il campo vuoto significa "lascia com'e'" o "togli
   tutti".
3. Rifiniture libreria: ordinamento, paginazione.

# Da sapere prima di toccare qualcosa

- **Non lanciare `next build` con `next dev` attivo.** Corrompe
  `.next/dev/types` e il typecheck fallisce con errori di sintassi in file che
  non hai scritto.
- **Per fermare il dev server serve PowerShell**, `pkill` non basta.
- **Le verifiche end-to-end si fanno da Node**, con le credenziali in
  `.env.local`: login con `@supabase/supabase-js`, e per chiamare le rotte
  autenticate si forgia il cookie nel formato di `@supabase/ssr` — nome
  `sb-<ref>-auth-token`, valore `base64-` + `stringToBase64URL(session)`,
  spezzato in chunk da 3180 caratteri.
- **Le credenziali stanno in `.env.local`**, che e' gitignored. Se quel file
  dovesse mai servire a qualcun altro, la password va cambiata.
- **I template email di Supabase** vanno impostati su
  `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type={{ .Type }}`,
  altrimenti i link di recupero e cambio email non lasciano cookie.
- **Nessuna rotta puo' avere un primo segmento di due lettere**: il proxy lo
  leggerebbe come codice lingua.
- **La tabella override in `directives/extract_manga_metadata.md` e' vuota** e
  la riempie l'utente, non l'agente. La cascata generica basta per i siti
  provati finora.
- Esistono `frontend/AGENTS.md` e `frontend/CLAUDE.md` non tracciati, creati
  fuori da questa sessione: leggerli prima di committare.
