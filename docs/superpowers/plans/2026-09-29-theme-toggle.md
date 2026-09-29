# Tema chiaro/scuro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** L'utente cambia tra tema chiaro, scuro e "sistema" con un pulsante nella navbar; la scelta resta in un cookie e si applica lato server, senza flash e senza JavaScript.

**Architecture:** I colori diventano variabili CSS in canali RGB che Tailwind legge; `secondary`, `neutral-dark` e `neutral-light` si scambiano nel tema scuro, mentre due token fissi `ink`/`paper` coprono le superfici che non devono invertirsi. Il layout radice legge il cookie `loresync-theme` e mette `data-theme` su `<html>` solo per una scelta esplicita; senza scelta decide `prefers-color-scheme`. Il pulsante è un form POST verso una server action, sul modello di `setAdultMode`.

**Tech Stack:** Next 16.3 (App Router, Server Actions), Tailwind 3.4.19, TypeScript. Nessuna dipendenza nuova.

**Spec:** `docs/superpowers/specs/2026-09-29-theme-toggle-design.md`

## Global Constraints

- Nessun esadecimale nuovo: nel tema scuro si usano solo i cinque colori di `brand-guidelines.md` (`#E10600`, `#050505`, `#FFC400`, `#0A0A0A`, `#F5F5F5`).
- Nessuna dipendenza nuova (niente `next-themes`).
- Cookie `loresync-theme`, valori `light` | `dark`; assente = sistema; durata `PREFERENCE_MAX_AGE` (`lib/cookies.ts`); `sameSite: "lax"`, `path: "/"`.
- Cambiare tema è un form POST, mai un link (regola scritta in `setAdultMode`).
- Nessun JavaScript lato client per il tema, nessun flash: `data-theme` lo scrive il server.
- Commenti in italiano, nello stile dei file circostanti (apostrofo al posto dell'accento: `e'`, `piu'`, `perche'`). Il commento spiega il perché, non il cosa.
- Prima di scrivere codice Next, la guida in `node_modules/next/dist/docs/` è la fonte (`AGENTS.md`): per `viewport.colorScheme` vedi `01-app/03-api-reference/04-functions/generate-viewport.md`.
- I valori di configurazione non si inventano: qui non ne servono di nuovi.
- Ogni commit finisce con la riga `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Non mettere in stage `frontend/AGENTS.md` né altri file toccati da `next dev`.
- Tutti i comandi si lanciano da `D:\DEVS\loresync\frontend` (shell bash).

## Review Focus

Casi che la spec implica ma che il codice non protegge da sé, dal più probabile:

1. **Cookie manomesso o sconosciuto** (`purple`, `system`, `""`, `dark; x`): deve dare "sistema", mai un errore. Test in Task 1.
2. **Scelta esplicita chiaro con sistema scuro**: `data-theme="light"` deve battere `prefers-color-scheme: dark`. Verificato in Task 2 sul CSS generato e sull'HTML servito.
3. **Hover dei pulsanti rossi in tema scuro**: testo `paper` su riempimento `secondary` sarebbe chiaro su chiaro, cioè illeggibile. Controllo con grep in Task 3.
4. **Logo doppio o assente**: in ogni tema deve essere visibile una sola versione. Verificato in Task 4.
5. **Riga in alto a 360px**: logo, lingua, tema e logout non devono andare a capo. Verificato in Task 5.

---

## File Structure

| File | Responsabilità |
|---|---|
| `lib/theme.ts` (nuovo) | Modi, nome del cookie, `resolveTheme`, `nextTheme`. Solo funzioni pure, nessun import: gira anche sotto `node --test`. |
| `lib/theme.test.ts` (nuovo) | Test di `lib/theme.ts` con `node:test`. |
| `app/globals.css` | Variabili colore (canali RGB), blocchi chiaro/scuro, `color-scheme`. |
| `tailwind.config.ts` | Colori letti dalle variabili, token `ink`/`paper`, variante `dark:`. |
| `app/[locale]/layout.tsx` | Legge il cookie, mette `data-theme` su `<html>`, `viewport.colorScheme`. |
| `components/ui/form-styles.ts` | Pulsanti con testo `paper` fisso + `hover:text-neutral-light`; nuova classe icona touch. |
| `app/[locale]/page.tsx` | Fasce nere su `ink`/`paper`, CTA, chip giallo; ospita il pulsante tema. |
| `components/ui/form-message.tsx` | Testo `ink` sul riquadro giallo. |
| `components/ui/logo.tsx` | `surface="auto"` (predefinito): entrambe le versioni, una nascosta via CSS. |
| `components/ui/icon.tsx` | Glifi `sun`, `moon`, `monitor`. |
| `lib/i18n/dictionaries/{it,en}.ts` | Stringhe `themeToLight`, `themeToDark`, `themeToSystem` in `common`. |
| `lib/preferences/actions.ts` | Server action `setTheme`. |
| `components/ui/theme-toggle.tsx` (nuovo) | Form con un pulsante: icona = modo attuale, nome = azione. |
| `app/[locale]/(app)/layout.tsx` | Ospita il pulsante, stringe la riga in alto su telefono. |
| `components/ui/locale-switcher.tsx` | Riquadro lingua più stretto su telefono. |
| `package.json`, `tsconfig.json` | Script `test`; `allowImportingTsExtensions` per importare `./theme.ts` nel test. |

---

### Task 1: Modello del tema, con test

**Files:**
- Create: `lib/theme.ts`
- Create: `lib/theme.test.ts`
- Modify: `package.json` (script `test`)
- Modify: `tsconfig.json` (`allowImportingTsExtensions`)

**Interfaces:**
- Produces (usato da Task 2 e Task 5):
  - `THEME_MODES: readonly ["system", "light", "dark"]`
  - `type ThemeMode = "system" | "light" | "dark"`
  - `THEME_COOKIE: "loresync-theme"`
  - `isThemeMode(value: string): value is ThemeMode`
  - `resolveTheme(cookie: string | undefined): ThemeMode`
  - `nextTheme(current: ThemeMode): ThemeMode` (system → light → dark → system)

Il repo non ha test automatici. Si aggiunge il minimo: il runner integrato di Node 24 (che esegue TypeScript senza compilarlo) su un file di sole funzioni pure.

- [ ] **Step 1: Creare il ramo**

```bash
git switch -c feat/theme-toggle
```

Expected: `Switched to a new branch 'feat/theme-toggle'` (il commit della spec viene con sé).

- [ ] **Step 2: Scrivere il test che fallisce**

Creare `lib/theme.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  THEME_COOKIE,
  THEME_MODES,
  isThemeMode,
  nextTheme,
  resolveTheme,
} from "./theme.ts";

test("un cookie assente vale sistema", () => {
  assert.equal(resolveTheme(undefined), "system");
});

test("chiaro e scuro si leggono cosi' come sono", () => {
  assert.equal(resolveTheme("light"), "light");
  assert.equal(resolveTheme("dark"), "dark");
});

// Il cookie lo puo' riscrivere chiunque dal browser: qualunque altro valore
// ricade su sistema, senza errori e senza scegliere un tema a caso. Anche
// "system", che l'applicazione non scrive mai (per sistema cancella il cookie).
test("un cookie sconosciuto o manomesso vale sistema", () => {
  for (const value of ["", "purple", "system", "DARK", "dark; x", "__proto__"]) {
    assert.equal(resolveTheme(value), "system", value);
  }
});

test("il ciclo e' sistema, chiaro, scuro, poi di nuovo sistema", () => {
  assert.equal(nextTheme("system"), "light");
  assert.equal(nextTheme("light"), "dark");
  assert.equal(nextTheme("dark"), "system");
});

test("tre passi riportano al punto di partenza, da qualunque modo", () => {
  for (const start of THEME_MODES) {
    assert.equal(nextTheme(nextTheme(nextTheme(start))), start);
  }
});

// `isThemeMode` filtra il campo `mode` di un form POST, che chiunque sappia
// costruirne uno puo' riempire come vuole.
test("isThemeMode accetta solo i tre modi", () => {
  for (const value of THEME_MODES) assert.equal(isThemeMode(value), true);
  for (const value of ["", "auto", "Light", "__proto__", "constructor", "0"]) {
    assert.equal(isThemeMode(value), false, value);
  }
});

test("il cookie ha il prefisso dell'applicazione", () => {
  assert.equal(THEME_COOKIE, "loresync-theme");
});
```

- [ ] **Step 3: Aggiungere lo script e la opzione di tsconfig**

In `package.json`, dentro `"scripts"`, dopo `"typecheck"`:

```json
    "typecheck": "tsc --noEmit",
    "test": "node --test lib/theme.test.ts"
```

In `tsconfig.json`, dentro `compilerOptions`, dopo `"noEmit": true,`:

```json
    "noEmit": true,
    "allowImportingTsExtensions": true,
```

(Node esegue solo import con estensione esplicita; `noEmit` è già attivo, quindi l'opzione è ammessa.)

- [ ] **Step 4: Eseguire il test e vederlo fallire**

Run: `npm test`
Expected: FAIL con `ERR_MODULE_NOT_FOUND` per `./theme.ts`.

- [ ] **Step 5: Implementare `lib/theme.ts`**

```ts
/**
 * Tema dell'interfaccia: chiaro, scuro, o quello del dispositivo.
 *
 * Stesso schema di `lib/adult.ts` e `lib/view-mode.ts` — un cookie, un
 * `resolve…` che ne legge il valore — con una differenza: qui non c'e' un
 * parametro nell'URL. Un tema non fa parte di cio' che un link condiviso deve
 * mostrare, e la scelta la scrive una server action, non il proxy.
 *
 * "Sistema" non e' un valore del cookie: e' il cookie che manca. Scegliere
 * "sistema" lo cancella, cosi' non esistono due modi di dire la stessa cosa.
 * Senza cookie decide `prefers-color-scheme`, dal CSS, senza JavaScript.
 *
 * Il file non importa niente, di proposito: cosi' i test lo eseguono con
 * `node --test` senza bisogno di Next.
 */

/** Modi ammessi, nell'ordine in cui il pulsante li attraversa. */
export const THEME_MODES = ["system", "light", "dark"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

/** Chi non ha mai scelto segue il dispositivo. */
export const DEFAULT_THEME_MODE: ThemeMode = "system";

/** Nome del cookie. Il prefisso distingue i nostri da quelli di Supabase. */
export const THEME_COOKIE = "loresync-theme";

export const isThemeMode = (value: string): value is ThemeMode =>
  (THEME_MODES as readonly string[]).includes(value);

/**
 * Il modo scelto, dal valore del cookie.
 *
 * Solo `light` e `dark` sono scelte scritte: qualunque altra cosa — assente,
 * scaduto, riscritto a mano — vale "sistema", mai un tema a caso.
 */
export const resolveTheme = (cookie: string | undefined): ThemeMode =>
  cookie === "light" || cookie === "dark" ? cookie : DEFAULT_THEME_MODE;

/** Il modo che il pulsante seleziona alla prossima pressione. */
export const nextTheme = (current: ThemeMode): ThemeMode =>
  THEME_MODES[(THEME_MODES.indexOf(current) + 1) % THEME_MODES.length];
```

- [ ] **Step 6: Eseguire test, typecheck e lint**

Run: `npm test && npm run typecheck && npx eslint lib`
Expected: 7 test passati, nessun errore di tipo, nessun avviso di lint.

- [ ] **Step 7: Commit**

```bash
git add lib/theme.ts lib/theme.test.ts package.json tsconfig.json
git commit -m "feat: add theme model with unit tests" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Token di colore e selezione lato server

**Files:**
- Modify: `app/globals.css` (riscrittura del blocco `:root`, `body`, `:focus-visible`)
- Modify: `tailwind.config.ts` (colori, token fissi, variante `dark:`)
- Modify: `app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `THEME_COOKIE`, `resolveTheme` (Task 1).
- Produces: classi Tailwind `bg-ink`, `text-ink`, `border-ink`, `bg-paper`, `text-paper`, `border-paper` e la variante `dark:` (usate da Task 3, 4); attributo `data-theme` su `<html>`.

Con i valori del tema chiaro identici a quelli di oggi, il tema chiaro non deve cambiare di un pixel.

- [ ] **Step 1: Sostituire `app/globals.css`**

Il file diventa (il resto — `h1..h4` — resta com'è; qui è riportato per intero):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Token da brand-guidelines.md. Due soli typeface (Anton, Barlow) e due soli
   pesi complessivi (400, 700): l'accoppiata e' il limite fissato dalle
   guideline.

   I colori sono canali RGB ("R G B" separati da spazi) e non esadecimali:
   Tailwind li legge con `rgb(var(--color-…) / <alpha-value>)`, e cosi' le classi
   con opacita' continuano a funzionare. I nomi descrivono i valori del tema
   chiaro: nel tema scuro `secondary` e' chiaro e `neutral-light` e' scuro, cioe'
   i due neutri si scambiano. Non esistono colori nuovi: il tema scuro usa solo
   quelli del brand.

   `ink` e `paper` NON si scambiano. Servono dove un colore deve restare quello
   che e' in qualunque tema: il testo sui pulsanti rossi, le fasce nere della
   landing, il testo sul riquadro giallo. */
:root {
  --font-heading: "Anton", Impact, sans-serif;
  --font-body: "Barlow", system-ui, sans-serif;

  --color-primary: 225 6 0;
  --color-accent: 255 196 0;
  --color-secondary: 5 5 5;
  --color-neutral-dark: 10 10 10;
  --color-neutral-light: 245 245 245;

  --color-ink: 5 5 5;
  --color-paper: 245 245 245;

  /* Dice al browser con quali colori disegnare i controlli suoi: menu a
     tendina aperti, barre di scorrimento, campi di ricerca. */
  color-scheme: light;
}

/* Senza una scelta salvata decide il dispositivo. `:not([data-theme])`: una
   scelta esplicita (`data-theme="light"` o `"dark"`, scritta dal layout radice)
   batte sempre il dispositivo, anche quando dice il contrario. I due blocchi
   scuri sono identici e vanno tenuti allineati: il CSS non permette di
   condividere una dichiarazione fra una media query e un selettore. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-secondary: 245 245 245;
    --color-neutral-dark: 245 245 245;
    --color-neutral-light: 5 5 5;
    color-scheme: dark;
  }
}

:root[data-theme="dark"] {
  --color-secondary: 245 245 245;
  --color-neutral-dark: 245 245 245;
  --color-neutral-light: 5 5 5;
  color-scheme: dark;
}

body {
  background-color: rgb(var(--color-neutral-light));
  color: rgb(var(--color-secondary));
  font-weight: 400;
}

h1,
h2,
h3,
h4 {
  font-family: var(--font-heading);
  font-weight: 400;
  /* Anton e' condensato: a corpo grande l'interlinea di default apre troppo. */
  line-height: 0.9;
  letter-spacing: -0.01em;
}

/* Un solo stile di focus, visibile su fondo chiaro e su fondo nero. */
:focus-visible {
  outline: 3px solid rgb(var(--color-primary));
  outline-offset: 3px;
}
```

- [ ] **Step 2: Aggiornare `tailwind.config.ts`**

Sostituire l'apertura `const config: Config = {` … `theme: {` e il blocco `colors`. Il file completo dell'oggetto diventa:

```ts
import type { Config } from "tailwindcss";

// Valori da brand-guidelines.md (mood Bold). I colori vivono in
// `app/globals.css` come variabili, perche' cambiano col tema.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  // La variante `dark:` segue le stesse regole delle variabili: scelta
  // esplicita (`data-theme`) prima, dispositivo solo se non c'e' scelta.
  // Serve dove il tema cambia cio' che si mostra e non un colore — il logo.
  darkMode: [
    "variant",
    [
      "@media (prefers-color-scheme: dark) { &:not([data-theme=light] *) }",
      "&:is([data-theme=dark] *)",
    ],
  ],
  theme: {
    // Raggio 0px: sovrascritto, non esteso, cosi' nessuna utility `rounded-*`
    // puo' reintrodurre angoli arrotondati per distrazione.
    borderRadius: {
      none: "0",
      DEFAULT: "0",
      sm: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      "3xl": "0",
      full: "0",
    },
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "neutral-dark": "rgb(var(--color-neutral-dark) / <alpha-value>)",
        "neutral-light": "rgb(var(--color-neutral-light) / <alpha-value>)",
        // Fissi: non si scambiano nel tema scuro.
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
      },
```

Il resto del file (da `fontFamily` in poi) resta invariato.

- [ ] **Step 3: Aggiornare `app/[locale]/layout.tsx`**

Import: sostituire `import type { Metadata } from "next";` con:

```tsx
import type { Metadata, Viewport } from "next";
```

e aggiungere, dopo l'import di `@/lib/i18n/config`:

```tsx
import { THEME_COOKIE, resolveTheme } from "@/lib/theme";
```

Dopo `generateMetadata` aggiungere:

```tsx
// Dichiara che la pagina sa disegnarsi in entrambi i temi: il browser puo'
// cosi' colorare da subito le parti sue (barre, controlli) prima ancora che il
// CSS arrivi. Il tema vero lo decide `data-theme` piu' sotto.
export const viewport: Viewport = { colorScheme: "light dark" };
```

Sostituire il blocco della fascia cookie:

```tsx
  const seenNotice = hasSeenNotice(
    (await cookies()).get(NOTICE_COOKIE)?.value,
  );
```

con:

```tsx
  const cookieStore = await cookies();
  const seenNotice = hasSeenNotice(cookieStore.get(NOTICE_COOKIE)?.value);

  // Il tema si decide qui e non nel browser, per lo stesso motivo della fascia
  // cookie: uno script che lo applica dopo il caricamento mostrerebbe per un
  // istante il tema sbagliato. Per "sistema" non si scrive niente: decide il
  // CSS, con `prefers-color-scheme`.
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE)?.value);
```

e sostituire il tag `<html …>`:

```tsx
    <html
      lang={locale}
      data-theme={theme === "system" ? undefined : theme}
      className={`${anton.variable} ${barlow.variable}`}
    >
```

- [ ] **Step 4: Typecheck, lint, build**

Run: `npm run typecheck && npx eslint . && npx next build 2>&1 | tail -8`
Expected: nessun errore; il build elenca le stesse rotte di prima.

- [ ] **Step 5: Verificare le regole nel CSS generato**

Il caso *scelta esplicita chiaro con dispositivo scuro* (Review Focus 2) si regge sul fatto che il blocco media escluda `[data-theme]`.

Run:
```bash
cat .next/static/chunks/*.css | grep -cF ':root:not([data-theme])'
cat .next/static/chunks/*.css | grep -cF ':root[data-theme=dark]'
cat .next/static/chunks/*.css | grep -cF 'rgb(var(--color-paper)'
```
Expected: ciascuno `>= 1`. (Se il secondo dà 0, cercare `data-theme="dark"` con le virgolette: la minificazione può cambiarle.)

- [ ] **Step 6: Verificare che il server scriva `data-theme` (no flash)**

Run (in un secondo terminale, `npm run dev` avviato prima):
```bash
curl -s -H "Cookie: loresync-theme=dark" http://localhost:3000/it | grep -o '<html[^>]*>'
curl -s -H "Cookie: loresync-theme=light" http://localhost:3000/it | grep -o '<html[^>]*>'
curl -s http://localhost:3000/it | grep -o '<html[^>]*>'
curl -s -H "Cookie: loresync-theme=purple" http://localhost:3000/it | grep -o '<html[^>]*>'
```
Expected: i primi due contengono `data-theme="dark"` e `data-theme="light"`; gli ultimi due **non** contengono `data-theme`.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css tailwind.config.ts "app/[locale]/layout.tsx"
git commit -m "feat: theme tokens as CSS variables and server-side theme selection" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

Nota: da qui a Task 3 il tema scuro è raggiungibile (cookie a mano o dispositivo) ma i pulsanti rossi e le fasce nere non sono ancora a posto. È atteso.

---

### Task 3: Superfici che non devono invertirsi

**Files:**
- Modify: `components/ui/form-styles.ts` (righe 70, 79, 81, 89, 102, 104)
- Modify: `app/[locale]/page.tsx` (righe 22, 122–124, 161, 173, il bordo delle voci in `limits`)
- Modify: `components/ui/form-message.tsx`

**Interfaces:**
- Consumes: `text-paper`, `bg-ink`, `border-paper`, `text-ink` (Task 2).
- Produces: nessuna interfaccia nuova.

La regola: chi sta su un fondo che non si inverte (rosso, giallo, fascia nera) usa `paper`/`ink`. Chi *riempie* di `secondary` all'hover deve anche cambiare il testo in `neutral-light`, altrimenti nel tema scuro sarebbe chiaro su chiaro.

- [ ] **Step 1: Pulsanti rossi in `form-styles.ts`**

Run:
```bash
sed -i 's/ text-neutral-light hover:border-secondary hover:bg-secondary/ text-paper hover:border-secondary hover:bg-secondary hover:text-neutral-light/' components/ui/form-styles.ts
sed -i 's/hover:bg-primary hover:text-neutral-light/hover:bg-primary hover:text-paper/' components/ui/form-styles.ts
grep -n "text-paper\|text-neutral-light" components/ui/form-styles.ts | cut -c1-40
```
Expected: `text-paper` compare su 6 righe (70, 79, 81, 89 con `hover:text-neutral-light` in coda; 102, 104 con `hover:text-paper`). Nessun `text-neutral-light` "nudo" rimasto, cioè non preceduto da `hover:`.

- [ ] **Step 2: Verificare la coppia riempimento/testo (Review Focus 3)**

Run:
```bash
grep -rn "text-paper" app components | grep -v "hover:text-neutral-light" | cut -c1-140
```
Expected: solo righe dove il fondo di hover *non* diventa `secondary`: le due righe `BUTTON_DANGER*` (hover su `primary`), gli elementi su `bg-ink` e la CTA che si sistema al passo successivo. Per ogni altra riga con `hover:bg-secondary` accanto deve esserci `hover:text-neutral-light`.

- [ ] **Step 3: Landing**

In `app/[locale]/page.tsx`:

`CTA_CLASS`:
```tsx
const CTA_CLASS =
  "inline-block bg-primary px-step-3 py-step-2 font-bold uppercase tracking-wide text-paper hover:bg-secondary hover:text-neutral-light";
```

Fascia del wordmark (era `bg-secondary` e `text-neutral-light`):
```tsx
        <div
          aria-hidden
          className="overflow-hidden border-b-2 border-secondary bg-ink"
        >
          <span className="-ml-[3vw] block whitespace-nowrap font-heading text-[clamp(5rem,26vw,20rem)] uppercase leading-[0.8] text-paper">
```

Chip "in corso" (il riquadro giallo, con testo che nel tema scuro sarebbe chiaro):
```tsx
                    status === "in_corso" ? "bg-accent text-ink" : ""
```

Sezione dei limiti:
```tsx
        <section className="bg-ink text-paper">
```
e, dentro, la riga di ogni voce: `border-t-2 border-neutral-light py-step-2` diventa
```tsx
                    className="border-t-2 border-paper py-step-2 text-lg md:text-xl"
```

- [ ] **Step 4: Riquadro giallo dei messaggi**

In `components/ui/form-message.tsx`:
```tsx
          : "border-secondary bg-accent text-ink"
```

- [ ] **Step 5: Nessun colore invertibile rimasto su fondi fissi**

Run:
```bash
grep -rnE "bg-(primary|accent|ink)" app components | grep -E "neutral-light|text-secondary|neutral-dark" | grep -v "hover:text-neutral-light" | cut -c1-150
```
Expected: nessuna riga. (Una riga qui = testo che si inverte su un fondo che non lo fa.)

- [ ] **Step 6: Typecheck, lint, build**

Run: `npm run typecheck && npx eslint . && npx next build 2>&1 | tail -5`
Expected: verde.

- [ ] **Step 7: Controllo visivo in tema chiaro (deve essere identico a prima)**

Con `npm run dev`, aprire `/it` e una pagina con pulsanti rossi in tema chiaro. Passare il mouse su un pulsante rosso: sfondo nero, testo chiaro, come prima.

- [ ] **Step 8: Commit**

```bash
git add components/ui/form-styles.ts "app/[locale]/page.tsx" components/ui/form-message.tsx
git commit -m "feat: keep red buttons, black bands and yellow boxes fixed across themes" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Logo per tema

**Files:**
- Modify: `components/ui/logo.tsx`

**Interfaces:**
- Consumes: variante `dark:` (Task 2).
- Produces: `Logo` con `surface?: "light" | "dark" | "auto"`, predefinito **`"auto"`**. Le quattro pagine che lo usano senza `surface` (landing, login, legali, area autenticata) seguono il tema da sole.

- [ ] **Step 1: Sostituire il componente**

`components/ui/logo.tsx` diventa:

```tsx
import Image from "next/image";
import onDark from "@/lib/img/logo-on-dark.png";
import onLight from "@/lib/img/logo-on-light.png";

/**
 * Il segno del marchio.
 *
 * Due file e non uno colorato via CSS: il logo non e' monocromatico — le barre
 * restano rosse in entrambe le versioni, e cambia solo il campo, nero su fondo
 * chiaro e bianco su fondo scuro. `surface` dice su che fondo sta il segno,
 * non di che colore e', cosi' chi lo usa non deve ricordarsi quale file e'
 * quale.
 *
 * `auto` e' per chi sta sul fondo della pagina, che cambia col tema: rende
 * entrambe le versioni e ne lascia visibile una sola, scelta dal CSS con la
 * stessa regola delle variabili di colore. Non si sceglie con JavaScript perche'
 * il tema lo decide il server o il dispositivo, e uno script mostrerebbe per un
 * istante il segno sbagliato. `light` e `dark` restano per i fondi fissi, che
 * non seguono il tema (le fasce nere).
 *
 * Qui `next/image` va bene, al contrario delle copertine: il file e' nostro e
 * sta nel progetto, quindi non c'e' nessun host esterno da autorizzare e in
 * cambio si ottengono le due densita' senza scriverle a mano.
 */
export const Logo = ({
  surface = "auto",
  size = 32,
  className = "",
}: {
  /** Fondo su cui appoggia il segno: quello della pagina (`auto`) o fisso. */
  surface?: "light" | "dark" | "auto";
  /** Lato in pixel: il segno e' quadrato. */
  size?: number;
  className?: string;
}) => {
  // Decorativo: ovunque compaia, accanto c'e' scritto "Loresync". Un testo
  // alternativo lo farebbe leggere due volte a chi usa uno screen reader.
  if (surface !== "auto") {
    return (
      <Image
        src={surface === "dark" ? onDark : onLight}
        alt=""
        width={size}
        height={size}
        className={className}
      />
    );
  }

  return (
    <>
      <Image
        src={onLight}
        alt=""
        width={size}
        height={size}
        className={`${className} dark:hidden`}
      />
      <Image
        src={onDark}
        alt=""
        width={size}
        height={size}
        className={`${className} hidden dark:block`}
      />
    </>
  );
};
```

- [ ] **Step 2: Typecheck, lint, build**

Run: `npm run typecheck && npx eslint . && npx next build 2>&1 | tail -5`
Expected: verde.

- [ ] **Step 3: Una sola versione visibile per volta (Review Focus 4)**

Run:
```bash
cat .next/static/chunks/*.css | grep -oE '\.dark\\:hidden[^{]*\{[^}]*\}|\.dark\\:block[^{]*\{[^}]*\}' | head -6
```
Expected: entrambe le classi presenti, con `display:none` per la prima e `display:block` per la seconda, dentro la stessa condizione (`prefers-color-scheme: dark` e `data-theme`).

Poi a vista, con `npm run dev` su `/it/login`:
- dispositivo chiaro: un solo logo, campo nero;
- dispositivo scuro (`msedge --headless --screenshot=… --blink-settings=preferredColorScheme=1 http://localhost:3000/it/login`): un solo logo, campo bianco, nessun "doppione" affiancato.

- [ ] **Step 4: Commit**

```bash
git add components/ui/logo.tsx
git commit -m "feat: pick the logo variant by theme" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Pulsante del tema

**Files:**
- Modify: `components/ui/icon.tsx` (tre glifi)
- Modify: `lib/i18n/dictionaries/it.ts`, `lib/i18n/dictionaries/en.ts`
- Modify: `lib/preferences/actions.ts`
- Modify: `components/ui/form-styles.ts` (una classe)
- Create: `components/ui/theme-toggle.tsx`
- Modify: `app/[locale]/(app)/layout.tsx`
- Modify: `app/[locale]/page.tsx`
- Modify: `components/ui/locale-switcher.tsx`

**Interfaces:**
- Consumes: `THEME_COOKIE`, `ThemeMode`, `isThemeMode`, `nextTheme`, `resolveTheme` (Task 1); `PREFERENCE_MAX_AGE` (`lib/cookies.ts`).
- Produces:
  - `setTheme(formData: FormData): Promise<void>` — legge il campo `mode`.
  - `ThemeToggle({ current: ThemeMode; labels: Dictionary["common"] })`.
  - `BUTTON_ICON_GHOST_FILTER_CLASS`.
  - `Dictionary["common"]` con `themeToLight`, `themeToDark`, `themeToSystem`.

- [ ] **Step 1: Glifi**

In `components/ui/icon.tsx`, prima di `} satisfies Record<string, ReactNode>;`, dopo la voce `"eye-off"`:

```tsx
  /** Tema chiaro: un sole squadrato, con i quattro raggi ai lati. */
  sun: (
    <>
      <rect x="5" y="5" width="6" height="6" />
      <path d="M8 1v2" />
      <path d="M8 13v2" />
      <path d="M1 8h2" />
      <path d="M13 8h2" />
    </>
  ),

  /** Tema scuro: una falce di luna. */
  moon: <path d="M14 8.5A6 6 0 1 1 7.5 2 4.7 4.7 0 0 0 14 8.5z" />,

  /** Tema del dispositivo: uno schermo su un piede. */
  monitor: (
    <>
      <rect x="1" y="2" width="14" height="9" />
      <path d="M8 11v3" />
      <path d="M5 14h6" />
    </>
  ),
```

- [ ] **Step 2: Stringhe**

`lib/i18n/dictionaries/it.ts`, in `common`, dopo `passwordHide`:

```ts
    // Nominano cosa succede premendo, non il tema attuale: come per la
    // password e per i contenuti per adulti. Il pulsante cicla, quindi la
    // frase dipende da dove si va.
    themeToLight: "Passa al tema chiaro",
    themeToDark: "Passa al tema scuro",
    themeToSystem: "Usa il tema del dispositivo",
```

`lib/i18n/dictionaries/en.ts`, in `common`, dopo `passwordHide`:

```ts
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    themeToSystem: "Use device theme",
```

Verificare prima che `passwordHide` sia l'ultima chiave di `common` in `it.ts` (`grep -n "passwordHide" lib/i18n/dictionaries/it.ts`) e inserire subito dopo di essa, prima della `},` che chiude `common`.

- [ ] **Step 3: Server action**

In `lib/preferences/actions.ts`, aggiungere agli import:

```ts
import { THEME_COOKIE, isThemeMode } from "@/lib/theme";
```

e in fondo al file:

```ts
/**
 * Imposta il tema dell'interfaccia.
 *
 * Form POST e non link, per la ragione scritta in `setAdultMode`: cio' che
 * cambia uno stato non si chiede con un GET, che un prelievo anticipato
 * ripete da solo. Qui il pulsante punta sempre al modo **successivo** a quello
 * attuale, esattamente il caso in cui un prelievo riscriverebbe la scelta
 * appena fatta.
 *
 * Non fa `redirect`, come `acknowledgeCookieNotice`: rivalida il layout e Next
 * rirenderizza la pagina da cui e' partito il form, senza che questa debba
 * sapere quale fosse. `data-theme` sta sul layout radice, quindi va rivalidato
 * quello.
 *
 * "Sistema" cancella il cookie invece di scriverne uno: senza cookie decide il
 * dispositivo. Un valore fuori dai tre ammessi lascia la preferenza com'e',
 * perche' il campo lo puo' riscrivere chiunque.
 */
export const setTheme = async (formData: FormData): Promise<void> => {
  const mode = formData.get("mode");

  if (typeof mode === "string" && isThemeMode(mode)) {
    const store = await cookies();

    if (mode === "system") {
      store.delete(THEME_COOKIE);
    } else {
      store.set(THEME_COOKIE, mode, {
        path: "/",
        maxAge: PREFERENCE_MAX_AGE,
        sameSite: "lax",
      });
    }
  }

  revalidatePath("/", "layout");
};
```

- [ ] **Step 4: Classe del pulsante**

In `components/ui/form-styles.ts`, subito dopo `BUTTON_GHOST_FILTER_CLASS`:

```ts
/**
 * Solo icona, stessa altezza dei controlli della barra dei filtri: 48px sotto
 * `md`, 32px da `md`. Quadrato in entrambi i casi (`w-12`, `md:w-8`).
 */
export const BUTTON_ICON_GHOST_FILTER_CLASS = `${HEIGHT_FILTER} w-12 md:w-8 ${BOX} ${LABELLED} border-secondary hover:border-primary hover:text-primary`;
```

- [ ] **Step 5: Componente**

Creare `components/ui/theme-toggle.tsx`:

```tsx
import { BUTTON_ICON_GHOST_FILTER_CLASS } from "@/components/ui/form-styles";
import { Icon, type IconName } from "@/components/ui/icon";
import type { Dictionary } from "@/lib/i18n";
import { setTheme } from "@/lib/preferences/actions";
import { nextTheme, type ThemeMode } from "@/lib/theme";

/**
 * Cambia il tema: sistema, chiaro, scuro, e da capo.
 *
 * Un pulsante solo, che cicla, e non tre: sul telefono la riga in alto e' gia'
 * piena. Reggere il ciclo senza JavaScript e' possibile perche' il modo attuale
 * lo sa il server — "sistema" e' il cookie che manca — quindi anche il
 * successivo si calcola qui e viaggia nel form come campo nascosto.
 *
 * L'icona mostra il modo **attuale**, il testo `sr-only` dice cosa succede
 * premendo: la stessa convenzione dei selettori di vista e dei contenuti per
 * adulti. E' un form POST, vedi `setTheme`.
 */
export const ThemeToggle = ({
  current,
  labels,
}: {
  current: ThemeMode;
  labels: Dictionary["common"];
}) => {
  const next = nextTheme(current);

  const icon: Record<ThemeMode, IconName> = {
    system: "monitor",
    light: "sun",
    dark: "moon",
  };

  const action: Record<ThemeMode, string> = {
    system: labels.themeToSystem,
    light: labels.themeToLight,
    dark: labels.themeToDark,
  };

  return (
    <form action={setTheme}>
      <input type="hidden" name="mode" value={next} />
      <button type="submit" className={BUTTON_ICON_GHOST_FILTER_CLASS}>
        <Icon name={icon[current]} />
        <span className="sr-only">{action[next]}</span>
      </button>
    </form>
  );
};
```

- [ ] **Step 6: Navbar dell'area autenticata**

In `app/[locale]/(app)/layout.tsx`:

Import da aggiungere:
```tsx
import { cookies } from "next/headers";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { THEME_COOKIE, resolveTheme } from "@/lib/theme";
```

Dopo `const dict = getDictionary(locale);`:
```tsx
  const theme = resolveTheme((await cookies()).get(THEME_COOKIE)?.value);
```

Nel gruppo strumenti, subito dopo `<LocaleSwitcher … />`:
```tsx
          <ThemeToggle current={theme} labels={dict.common} />
```

Sul link del logo, la parola cala di un corpo su telefono per fare posto al quarto controllo (calcolo: ~114px di logo + 16 di gap + 184 di strumenti = 314 su 328 disponibili a 360px):
```tsx
          className="order-1 flex items-center gap-step-1 font-heading text-xl uppercase md:text-2xl"
```

In `components/ui/locale-switcher.tsx`, nella costante `TARGET`, `min-w-10` diventa `min-w-8`:
```tsx
const TARGET =
  "inline-flex h-12 min-w-8 items-center justify-center text-sm uppercase tracking-wide md:h-auto md:min-w-0";
```
e aggiornare il commento sopra: `Su telefono ogni codice e' un riquadro alto 48px e largo 32: la larghezza e' quella che lascia posto al pulsante del tema nella riga in alto.`

- [ ] **Step 7: Landing**

In `app/[locale]/page.tsx`, aggiungere gli import:
```tsx
import { cookies } from "next/headers";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { THEME_COOKIE, resolveTheme } from "@/lib/theme";
```

Dopo `const t = dict.landing;`:
```tsx
  const theme = resolveTheme((await cookies()).get(THEME_COOKIE)?.value);
```

Nel gruppo dell'intestazione, `items-baseline` diventa `items-center` (con un pulsante quadrato dentro la linea di base non allinea, come dice il commento nella navbar) e si aggiunge il pulsante:

```tsx
          <div className="flex items-center gap-step-2 md:gap-step-3">
            <LocaleSwitcher current={locale} labels={languageNames} />
            <ThemeToggle current={theme} labels={dict.common} />
            <Link
              href={loginHref}
              className="border-b-2 border-secondary text-sm font-bold uppercase tracking-wide hover:border-primary hover:text-primary"
            >
              {dict.common.login}
            </Link>
          </div>
```

- [ ] **Step 8: Typecheck, lint, build**

Run: `npm test && npm run typecheck && npx eslint . && npx next build 2>&1 | tail -5`
Expected: verde. Se `it.ts` e `en.ts` non combaciano, `tsc` lo dice qui.

- [ ] **Step 9: Il ciclo, a mano**

Con `npm run dev`, su `/it` (dispositivo chiaro, nessun cookie), premere il pulsante più volte:
1. icona schermo (sistema) → sole (chiaro) → luna (scuro) → schermo;
2. dopo "scuro" la pagina è scura al ricaricamento, senza lampo di chiaro;
3. DevTools → Application → Cookies: `loresync-theme` vale `light`, poi `dark`, poi sparisce;
4. dopo "chiaro" con dispositivo scuro, la pagina resta chiara (`data-theme="light"` batte il dispositivo);
5. `document.cookie = "loresync-theme=purple; path=/"` e ricarica: nessun errore, tema del dispositivo.

Con JavaScript disattivato (DevTools → Settings → Debugger → Disable JavaScript) il pulsante funziona ancora.

- [ ] **Step 10: Landing a 360px, in entrambi i temi (Review Focus 5)**

Run:
```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless --screenshot="$TEMP/landing-light.png" --window-size=360,800 http://localhost:3000/it
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless --screenshot="$TEMP/landing-dark.png" --window-size=360,800 --blink-settings=preferredColorScheme=1 http://localhost:3000/it
```
Aprire i due PNG: l'intestazione sta su una riga, senza scroll orizzontale; nel tema scuro il testo è chiaro su nero, le fasce nere restano nere, il chip "in corso" ha testo scuro su giallo.

La riga in alto dell'area autenticata (Task 5, Step 6) richiede la sessione: **da controllare a 360px sul browser dell'utente**, loggato. Se il gruppo strumenti va a capo, fallback in quest'ordine: (a) `md:gap-step-3` → togliere il `gap-step-1` fra i tre controlli e usare `gap-0`; (b) portare `h-12 w-12` di logout e tema a `h-11 w-11`.

- [ ] **Step 11: Commit**

```bash
git add components/ui/icon.tsx lib/i18n/dictionaries lib/preferences/actions.ts components/ui/form-styles.ts components/ui/theme-toggle.tsx "app/[locale]/(app)/layout.tsx" "app/[locale]/page.tsx" components/ui/locale-switcher.tsx
git commit -m "feat: add light/dark/system theme toggle to navbar and landing" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Verifica completa e allineamento della spec

**Files:**
- Modify: `docs/superpowers/specs/2026-09-29-theme-toggle-design.md`

Nessun codice nuovo: si controlla che tutto regga insieme e la spec si riallinea a ciò che è stato costruito.

- [ ] **Step 1: Suite completa**

Run: `npm test && npm run typecheck && npx eslint . && npx next build 2>&1 | tail -8`
Expected: 7 test passati; tutto il resto verde.

- [ ] **Step 2: Giro delle pagine, nei tre modi**

Con `npm run dev` e una sessione attiva, in ciascuno dei modi *sistema (dispositivo chiaro)*, *sistema (dispositivo scuro)*, *chiaro*, *scuro*:
landing, dashboard, libreria (elenco e griglia, con e senza filtri, pannello dei filtri aperto), scheda serie, account, login.

Controllare in particolare:
- testo e bordi leggibili ovunque; nessuna scritta chiara su fondo chiaro;
- pulsanti rossi: normali e all'hover (sfondo che si inverte, testo che segue);
- interruttori attivi (vista, contenuti per adulti, "Filtri" aperto);
- menu a tendina aperti: colori del sistema coerenti col tema (`color-scheme`);
- copertine in caricamento: il riquadro di attesa è nero nel tema scuro (rischio noto nella spec);
- **contrasto del rosso su nero, ~4,1:1**: guardare `hover:text-primary`, il codice lingua attivo e i pulsanti di eliminazione, e annotare se qualcosa è illeggibile. Non si sostituisce il colore.

- [ ] **Step 3: Aggiornare la spec**

In `docs/superpowers/specs/2026-09-29-theme-toggle-design.md`:

Nella sezione "1. Token di colore", sostituire il paragrafo che inizia con "Le classi di hover che riempiono di `secondary`" con:

```markdown
Chi *riempie* di `secondary` all'hover (i pulsanti rossi, `hover:bg-secondary`)
non si inverte da solo: con il testo fisso `paper` nel tema scuro sarebbe chiaro
su chiaro. Per questo quei pulsanti hanno `text-paper` a riposo e
`hover:text-neutral-light` in hover, così il testo segue il riempimento. Gli
interruttori attivi (`bg-secondary text-neutral-light`) si invertono in coppia e
non cambiano. Anche il chip "in corso" della landing (`bg-accent`) ha `text-ink`.
Nel tema scuro le fasce `bg-ink` della landing hanno lo stesso colore della
pagina (`#050505`): restano distinte solo per i filetti, non per il fondo.
```

Nella sezione "3. Logo", aggiungere in fondo: `Il valore predefinito di surface passa da "light" a "auto": landing, login, pagine legali e area autenticata usavano tutte il predefinito.`

Nella sezione "4. Pulsante", sostituire "Server action `cycleTheme`" con "Server action `setTheme`" (il campo `mode` porta già il modo successivo, calcolato dal server) e la riga delle stringhe con: `Stringhe it/en in common: themeToLight, themeToDark, themeToSystem (nominano l'azione, non il tema attuale).`

Nella sezione "Rischi", aggiornare il punto sulla larghezza: `Mitigato con logo text-xl sotto md e riquadri lingua da 32px; da confermare a 360px sull'area autenticata.`

Aggiungere, prima di "Verifica": `Struttura di test: il repo non ne aveva. Si aggiunge npm test (node --test) solo per lib/theme.ts, funzioni pure senza import; per questo tsconfig ha allowImportingTsExtensions.`

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-09-29-theme-toggle-design.md
git commit -m "docs: align theme spec with the implementation" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```
