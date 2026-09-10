# Resolve Chapter URL

## Obiettivo

Decidere dove porta il pulsante "Riprendi lettura" di una serie in libreria:
il link diretto al capitolo quando è disponibile e ancora valido, altrimenti la
pagina della serie. Da PROJECT.md il capitolo è un "quando possibile", non una
garanzia.

## Input

Dalla riga `manga_entries` (vedi `supabase/migrations/0001_init.sql`):

- `series_url` (obbligatorio): pagina della serie.
- `chapter_url` (opzionale): link al capitolo, così come incollato dall'utente.
- `current_chapter` (opzionale): ultimo capitolo raggiunto, decimale.

## Tool da usare

- `frontend/lib/reading-link.ts` — *da creare*. Funzione **pura**: nessuna rete,
  nessun accesso al database. Riceve i tre campi sopra e restituisce il target.
  Deve essere utilizzabile sia in Server Component sia in Client Component.

Nessuno script in `execution/`.

## Regola non negoziabile: nessun link costruito per inferenza

Non si indovina mai un URL di capitolo. Vedere `/manga/foo/chapter-12` non
autorizza a produrre `/manga/foo/chapter-13`: la numerazione salta, cambia
formato, usa gli slug del titolo del capitolo, o passa per un id opaco. Un link
inventato porta a un 404 — peggio dell'assenza del link, perché il pulsante
sembra funzionare.

Un URL di capitolo può essere prodotto in due soli modi:

1. l'utente lo ha incollato;
2. esiste un template per quell'host **fornito dall'utente** (tabella in fondo).

Fuori da questi due casi, il target è `series_url`.

## Procedura

1. **Verifica `chapter_url`.** Se assente → vai al punto 4.
2. **Controlla che non sia stantio.** Se dal link si legge un numero di capitolo
   e questo è **diverso** da `current_chapter`, il link punta a una lettura
   precedente: l'utente ha aggiornato il capitolo senza reincollare il link.
   È il caso più frequente in assoluto dopo qualche settimana d'uso.
   - Se esiste un template per l'host (punto 3), ricalcola.
   - Altrimenti scarta `chapter_url` e vai al punto 4. Riaprire il capitolo 38
     a chi è arrivato al 39 è un errore silenzioso: sembra che il pulsante
     funzioni, e si perde di nuovo il segno.
3. **Template per host** (solo se presente in tabella). Sostituisci i
   placeholder — `{slug}` estratto da `series_url` col pattern indicato,
   `{chapter}` da `current_chapter` col formato indicato — e usa il risultato.
4. **Fallback.** Target = `series_url`, `kind: "series"`.
5. **Valida il target prima di renderizzarlo.** Solo `http`/`https`: un valore
   `javascript:` salvato in `chapter_url` diventerebbe XSS all'`href`. Se la
   validazione non passa, il pulsante va disabilitato, non reso "alla meglio".
6. **Apri in una nuova scheda** con `target="_blank"` e
   `rel="noopener noreferrer"`. Link diretto alla piattaforma: **mai** un
   redirect interno tipo `/go?url=...`, che sarebbe un open redirect sul nostro
   dominio.

## Output

```ts
{ href: string; kind: "chapter" | "series"; stale: boolean }
```

`kind` serve alla UI per distinguere l'etichetta ("Riprendi dal capitolo 39" vs
"Apri la serie"). `stale` è `true` quando si è scartato un `chapter_url`
disallineato: la UI può invitare a reincollare il link aggiornato.

Nessuna scrittura su database: la risoluzione avviene a ogni render. Se in
futuro servisse persistere il link ricalcolato, va deciso a parte — un
`chapter_url` riscritto in automatico non sarebbe più distinguibile da uno
incollato dall'utente, e si perderebbe il controllo del punto 2.

## Casi limite e vincoli noti

- **Capitoli decimali.** `10.5`, `10.1`: la colonna è `numeric(8,2)`, i siti li
  scrivono come `chapter-10-5`, `chapter-10.5`, `10_5`. Il formato sta nel
  template dell'host, non in una regola globale.
- **Numeri con zeri iniziali.** `chapter-005` contro `chapter-5`: il confronto
  del punto 2 va fatto sul valore numerico, non sulla stringa, altrimenti ogni
  link risulta stantio.
- **Volume + capitolo.** `/vol-2/chapter-7` — il numero di capitolo da solo non
  identifica la pagina. Se il template non copre il volume, meglio non avere
  template per quell'host che averne uno che sbaglia.
- **Numerazione non estraibile.** Capitoli con slug (`/il-risveglio`) o id opaco
  (`/c/8f3a1`): il punto 2 non può decidere. In questo caso **non** scartare il
  link — non sappiamo che sia stantio — ma restituire `stale: false` e lasciare
  che sia l'utente a reincollarlo quando serve.
- **Mirror e cambi di dominio.** Gli aggregatori cambiano dominio spesso. Un
  `chapter_url` su un dominio morto resta salvato e continua a essere proposto:
  non lo rileviamo, perché questa procedura non fa rete. Sta all'utente
  aggiornare la entry.
- **Capitolo dietro login o paywall.** Il link è corretto ma la pagina rimanda
  altrove. Fuori dal nostro controllo, nessun trattamento speciale.
- **`current_chapter` nullo con `chapter_url` presente.** Il punto 2 non ha un
  riferimento per il confronto: usa `chapter_url` così com'è, `stale: false`.

## Template per host

Tabella **mantenuta dall'utente**, come quella di
`extract_manga_metadata.md`. Nessuna riga viene dedotta osservando i link
salvati: i pattern li fornisce l'utente per gli host che usa davvero.

Finché è vuota, il punto 3 è un no-op: vale solo il `chapter_url` incollato a
mano, con fallback alla serie. Questo è il comportamento MVP completo — la
tabella è un miglioramento, non un prerequisito.

| Host | Pattern slug da `series_url` | Template capitolo | Formato `{chapter}` |
|---|---|---|---|
| _(nessuno)_ | | | |

Quando un host viene aggiunto, verificare a mano che il link generato apra
davvero il capitolo giusto, e riportarlo nello storico.

## Storico aggiornamenti

- 2026-09-10: prima stesura. Tabella template vuota: attivi solo il
  `chapter_url` incollato dall'utente e il fallback a `series_url`. Stabilito
  che i template sono forniti dall'utente e che nessun URL di capitolo viene
  costruito per inferenza.
