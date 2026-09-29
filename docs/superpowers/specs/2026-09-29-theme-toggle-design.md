# Tema chiaro/scuro — design

Data: 2026-09-29. Stato: in attesa di revisione.

## Obiettivo

L'utente può passare tra tema chiaro e scuro. La scelta resta salvata e si
applica lato server, senza il flash del tema sbagliato al caricamento e senza
JavaScript, come le altre preferenze dell'app (vista, contenuti per adulti,
avviso cookie).

## Decisioni già prese

- **Tema iniziale: segue il sistema.** Senza scelta salvata si usa
  `prefers-color-scheme` del dispositivo.
- **Un solo pulsante** che cicla sistema → chiaro → scuro → sistema.
- **Solo colori del brand.** `brand-guidelines.md` non definisce una palette
  scura e non se ne inventa una: il tema scuro scambia i due neutri già
  esistenti. Nessun esadecimale nuovo.
- Il selettore sta nella navbar dell'area autenticata e nell'intestazione della
  landing. Non in login né nelle pagine legali.

## Fuori scopo

Favicon, immagine OG ed email di Supabase non cambiano col tema. Nessuna
libreria nuova (niente `next-themes`).

## Design

### 1. Token di colore

`app/globals.css` definisce i colori come variabili CSS in canali RGB;
`tailwind.config.ts` li legge con `rgb(var(--…) / <alpha-value>)`, così le
classi esistenti (`bg-neutral-light`, `border-secondary`, …) continuano a
funzionare e i 27 file che le usano non cambiano.

| Token | Chiaro | Scuro |
|---|---|---|
| `primary` | `#E10600` | `#E10600` |
| `accent` | `#FFC400` | `#FFC400` |
| `secondary` (testo, bordi) | `#050505` | `#F5F5F5` |
| `neutral-dark` (testo secondario) | `#0A0A0A` | `#F5F5F5` |
| `neutral-light` (sfondo) | `#F5F5F5` | `#050505` |

I nomi `secondary` e `neutral-*` descrivono i valori del tema chiaro: un
commento in `globals.css` lo dice, per non far credere che `secondary` sia
sempre nero.

**Token fissi `ink` (`#050505`) e `paper` (`#F5F5F5`)**, che non si invertono.
Servono dove lo scambio darebbe un risultato sbagliato:

- testo sui pulsanti rossi (`text-neutral-light` su `bg-primary` in
  `form-styles.ts` e nella landing) → `text-paper`;
- fasce nere della landing (`bg-secondary text-neutral-light`, righe 122–124 e
  173 di `app/[locale]/page.tsx`) → `bg-ink text-paper`;
- testo sul riquadro giallo di `components/ui/form-message.tsx` → `text-ink`.

Chi *riempie* di `secondary` all'hover (i pulsanti rossi, `hover:bg-secondary`)
non si inverte da solo: con il testo fisso `paper` nel tema scuro sarebbe chiaro
su chiaro. Per questo quei pulsanti hanno `text-paper` a riposo e
`hover:text-neutral-light` in hover, così il testo segue il riempimento. Gli
interruttori attivi (`bg-secondary text-neutral-light`) si invertono in coppia e
non cambiano. Anche il chip "in corso" della landing (`bg-accent`) ha `text-ink`.
Nel tema scuro le fasce `bg-ink` della landing hanno lo stesso colore della
pagina (`#050505`): restano distinte solo per i filetti, non per il fondo.

### 2. Selezione del tema

- Cookie `loresync-theme`, valori `light` | `dark`; assente = sistema. Durata
  `PREFERENCE_MAX_AGE` da `lib/cookies.ts`.
- `lib/theme.ts` (nuovo): modi, nome del cookie, `resolveTheme(cookie)` e
  `nextTheme(current)`, sul modello di `lib/adult.ts` e `lib/view-mode.ts`.
- `app/[locale]/layout.tsx` legge il cookie (già legge `cookies()` per l'avviso)
  e mette `data-theme` su `<html>` solo per una scelta esplicita.
- In `globals.css`:
  - `:root` = tema chiaro;
  - `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { … } }`;
  - `:root[data-theme="dark"] { … }`.
- `color-scheme` impostato coerentemente, così select, scrollbar e campi nativi
  seguono il tema. `<meta name="color-scheme" content="light dark">`.
- Variante Tailwind `dark:` ridefinita (`darkMode: ["variant", …]`) con gli
  stessi due selettori, per gli usi che devono differire per tema (il logo).

### 3. Logo

`Logo` ha già `logo-on-dark.png` e `logo-on-light.png`. Nuovo
`surface="auto"`: renderizza entrambe le immagini e ne mostra una via CSS
(`dark:hidden` / `hidden dark:block`). Gli usi con fondo fisso (fasce nere della
landing) restano `surface="dark"`. Navbar e intestazioni su fondo tema usano
`auto`. Il valore predefinito di `surface` passa da `"light"` a `"auto"`:
landing, login, pagine legali e area autenticata usavano tutte il predefinito.

### 4. Pulsante

- `components/ui/theme-toggle.tsx` (nuovo, Server Component): form POST con
  campo nascosto `mode` = tema successivo, calcolato dal server dal cookie.
- Server action `setTheme` in `lib/preferences/actions.ts` (il campo `mode` porta
  già il modo successivo, calcolato dal server): valida `mode`,
  scrive il cookie (`sameSite: "lax"`, `path: "/"`) o lo cancella per "sistema",
  poi `revalidatePath("/", "layout")`. Niente `redirect`: come
  `acknowledgeCookieNotice`, non serve sapere dove ci si trova. Un valore non
  ammesso lascia la preferenza com'è.
- POST e non link, per la regola già scritta in `setAdultMode`: un GET che
  cambia stato viene ripetuto dai prefetch.
- Icona = modo attuale (`sun`, `moon`, `monitor`), nuovi glifi in
  `components/ui/icon.tsx` (griglia 16×16, tratto 2, spigoli vivi). Il nome
  `sr-only` dice cosa succede premendo (es. "Passa al tema chiaro").
- Stile: `BUTTON_ICON_GHOST` a 48px sotto `md`, 32px da `md`, come i controlli
  della barra dei filtri.
- Posizione: gruppo strumenti dell'header in `app/[locale]/(app)/layout.tsx`
  (accanto a lingua e logout) e intestazione di `app/[locale]/page.tsx`.
- Stringhe `it`/`en` in `common`: `themeToLight`, `themeToDark`,
  `themeToSystem` (nominano l'azione, non il tema attuale).

## Rischi

- **Larghezza a 360px.** La riga in alto (logo, lingua, tema, logout) era circa
  330px su 328 disponibili. Mitigato con logo `text-xl` sotto `md` e riquadri
  lingua da 32px. Misurato con DevTools: l'intestazione dell'area autenticata sta
  su una riga a 360px e va a capo senza sfondare a 320px. Sulla landing, dove ci
  sono anche "Accedi" e nessun `flex-wrap`, il wordmark veniva compresso e "IT"
  lo sovrapponeva: risolto con `shrink-0`, gap più stretto e `flex-wrap`.
- **Contrasto del rosso su nero: circa 4,1:1**, sotto 4,5 per il testo piccolo.
  Il rosso in tema scuro compare nel testo di `hover:text-primary`, nel codice
  lingua attivo e nei pulsanti di eliminazione. È il colore del brand: non si
  sostituisce con uno nuovo. Si segnala e si decide dopo averlo visto.
- **Fondi non tematizzati.** Le copertine sono immagini esterne su
  `bg-neutral-light`: nel tema scuro il riquadro di attesa è nero. Da
  controllare.

## Verifica

Struttura di test: il repo non ne aveva. Si aggiunge `npm test` (`node --test`)
solo per `lib/theme.ts`, funzioni pure senza import; per questo `tsconfig.json`
ha `allowImportingTsExtensions`.

Per il resto `npm run typecheck`, `npm run lint`,
`npm run build`; poi controllo manuale nei tre modi (sistema, chiaro, scuro) di
landing, dashboard, libreria (elenco e griglia), scheda serie, account e login;
cookie assente con il sistema in scuro; ricarica senza flash; funzionamento con
JavaScript disattivato.
