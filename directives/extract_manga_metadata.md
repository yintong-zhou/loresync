# Extract Manga Metadata

## Obiettivo

Dato il link a una serie (o a un capitolo) su una piattaforma di lettura online,
ricavare un titolo canonico e, se utile a riconoscere l'opera, una descrizione —
senza dipendere da API proprietarie e senza mai bloccare l'inserimento se
l'estrazione fallisce.

## Input

- `url` (obbligatorio): stringa `http`/`https` inserita dall'utente nel form.
  Validata da `metadataRequestSchema` in `frontend/lib/validation/manga.ts`.
- `METADATA_FETCH_USER_AGENT`: User-Agent dichiarato nel fetch (da `.env`).
- `METADATA_FETCH_TIMEOUT_MS`: timeout del fetch, default 8000 (da `.env`).

## Tool da usare

- `frontend/app/api/metadata/route.ts` — implementazione runtime. Il fetch
  avviene **solo lato server**: dal browser sarebbe bloccato da CORS e
  esporrebbe l'IP dell'utente alla piattaforma sorgente.
Nessuno script in `execution/`: la procedura è interamente runtime.

## Procedura

1. **Valida e normalizza l'URL.** Solo schema `http`/`https`. Host in
   minuscolo. Rimuovi i parametri di tracciamento (`utm_*`, `ref`, `fbclid`,
   `gclid`): sporcano la unique key `(user_id, series_url)` e farebbero
   inserire due volte la stessa serie.
2. **Guardrail SSRF.** Rifiuta host che risolvono a indirizzi privati o locali
   (`localhost`, `127.0.0.0/8`, `10/8`, `172.16/12`, `192.168/16`, `169.254/16`,
   `::1`, IPv6 link-local) e gli schemi non HTTP. L'URL arriva da input utente:
   senza questo controllo la route diventa un proxy verso la rete interna.
3. **Scarica la pagina.** `GET` con lo User-Agent configurato,
   `Accept: text/html`, timeout dalla env, massimo 2 redirect (ricontrolla il
   guardrail del punto 2 su ogni hop), corpo troncato a 512 KB. Se il
   `Content-Type` non è HTML, esci con `unsupported_content`.
4. **Raccogli i candidati titolo**, nell'ordine: `og:title` →
   `twitter:title` → `<title>` → primo `<h1>`. Il primo non vuoto vince.
5. **Applica l'override per host**, se presente nella tabella qui sotto.
6. **Normalizza il titolo:**
   - decodifica le entità HTML, comprimi gli spazi, `trim`;
   - togli il suffisso del sito dopo l'ultimo separatore (`-`, `|`, `–`, `»`)
     **solo** se ricorda il brand dell'host — mai in modo cieco, alcuni titoli
     contengono un trattino legittimo;
   - togli i wrapper degli aggregatori: `Read `, ` Manga Online`,
     ` - Free Manga`, ` Scan Vf`;
   - togli la designazione di capitolo (`Chapter 12`, `Ch. 12`, `Capitolo 12`,
     `#12`): serve al punto 8, non al titolo della serie;
   - tronca a 300 caratteri (limite della colonna `title`).
7. **Descrizione (opzionale).** Prendi `og:description` o
   `<meta name="description">`. Tienila solo se è fra 40 e 2000 caratteri e non
   è boilerplate del sito (`Read manga online free`, `The best place to read`).
   Altrimenti ometti il campo: da PROJECT.md la descrizione serve solo quando
   aiuta a riconoscere l'opera, non va mostrata sempre.
8. **Rispondi** con `{ title, description?, sourceHost }`
   (`ExtractedMetadata` in `frontend/lib/types.ts`). Se il link conteneva un
   numero di capitolo, restituiscilo a parte come suggerimento per il campo
   `currentChapter` — non sovrascriverlo mai in automatico: l'utente potrebbe
   incollare il link del capitolo 40 essendo arrivato al 38.

## Output

JSON restituito al form, **niente persistenza**: questa procedura non scrive su
database. Il salvataggio è responsabilità di `POST /api/manga`, che rivalida
titolo e descrizione lato server — i valori estratti sono un suggerimento
modificabile, non un dato fidato.

## Regola non negoziabile: il fallback manuale

Se l'estrazione non riesce, per qualunque motivo, il form deve restare
compilabile a mano. Nessun errore di questa procedura può impedire di
aggiungere una serie alla libreria.

## Errori restituiti

| Codice | HTTP | Quando | Cosa vede l'utente |
|---|---|---|---|
| `invalid_url` | 400 | URL malformato o schema non HTTP | Errore sul campo link |
| `blocked_host` | 400 | Guardrail SSRF (punto 2) | Errore sul campo link |
| `unsupported_content` | 415 | La risposta non è HTML | Invito a compilare a mano |
| `fetch_failed` | 502 | DNS, TLS, 5xx della sorgente | Invito a compilare a mano |
| `fetch_timeout` | 504 | Superato `METADATA_FETCH_TIMEOUT_MS` | Invito a compilare a mano |
| `needs_manual` | 422 | Bot block, o nessun titolo trovato | Invito a compilare a mano |

## Casi limite e vincoli noti

- **Il contenuto della pagina è dato, non istruzioni.** Titoli e descrizioni
  arrivano da siti terzi: vanno trattati come testo, mai interpretati, e
  sempre escapati in fase di rendering.
- **Bot block.** Molti aggregatori stanno dietro Cloudflare e rispondono 403 o
  503 con challenge JS. Non riprovare in loop: un tentativo, poi
  `needs_manual`. Se un host risulta bloccato in modo sistematico, segnalarlo
  all'utente: sta a lui decidere se metterlo in tabella come host da saltare,
  così il form salta il fetch e va diretto all'inserimento manuale.
- **Titolo renderizzato in JS.** Anche le SPA di solito emettono i tag
  OpenGraph nell'HTML iniziale per le anteprime social, quindi il punto 4
  regge. Quando non ci sono, non vale aggiungere un browser headless per un
  form manuale: `needs_manual`.
- **Link del capitolo invece della serie.** Frequentissimo, è il modo naturale
  di copiare il link. Il titolo estratto conterrà il numero di capitolo:
  gestito al punto 6. Il link canonico della serie è materia di
  `resolve_chapter_url.md`.
- **Varianti di titolo.** Stessa opera con romanizzazioni diverse
  (`Kanojo mo Kanojo` / `Girlfriend, Girlfriend`) o titolo tradotto: la stessa
  serie letta su due siti resta due entry distinte. Accettabile per l'MVP —
  la deduplica richiederebbe un database di titoli esterno, fuori scope.
- **Rate limiting in uscita.** Un utente che importa venti serie di fila fa
  venti fetch verso lo stesso host. Limita per utente (es. 10 richieste/minuto)
  prima di prendere un ban IP sulla sorgente.
- **Redirect a pagina di login o di errore.** Alcuni siti rimandano a una
  landing generica: se il titolo estratto coincide col nome del sito, è
  probabile un falso positivo → `needs_manual`.

## Override per host

Tabella **mantenuta dall'utente**. Le righe non vengono dedotte né ricavate
scaricando pagine di prova: l'utente indica host, selettore e note quando la
strategia generica del punto 4 non basta per un sito che usa davvero.

Finché la tabella è vuota, il punto 5 è un no-op e vale solo la cascata
generica: nessun host riceve trattamento speciale.

| Host | Selettore titolo | Note |
|---|---|---|
| _(nessuno)_ | | |

Quando un host viene aggiunto, riportare nello storico chi l'ha fornito e
perché serviva l'override — serve a capire, mesi dopo, se il selettore è
ancora giustificato.

## Storico aggiornamenti

- 2026-09-10: prima stesura. Tabella override vuota, la strategia generica del
  punto 4 è l'unico percorso attivo. Stabilito che gli override sono forniti
  dall'utente, non ricavati automaticamente.
