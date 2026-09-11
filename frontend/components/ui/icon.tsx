import type { ReactNode } from "react";

/**
 * Le icone dell'interfaccia, disegnate qui invece di arrivare da una libreria.
 *
 * Il motivo non e' il peso: e' che il tratto deve combaciare con il resto.
 * Ogni controllo ha un bordo di 2px e nessun angolo arrotondato, e una
 * libreria di icone dallo stile morbido si vedrebbe subito che viene da fuori.
 * Qui il tratto e' 2, gli spigoli sono vivi (`butt` e `miter`, non `round`) e
 * la griglia e' 16x16, cioe' due unita' della scala di spaziatura.
 *
 * `currentColor` e non un colore fisso: dentro un pulsante rosso l'icona
 * diventa bianca da sola, e al passaggio del mouse cambia insieme
 * all'etichetta senza una riga di CSS in piu'.
 *
 * Aggiungere un glifo vuol dire aggiungere una voce qui: il tipo `IconName` si
 * aggiorna da solo e un nome sbagliato non compila.
 */
const ICONS = {
  /** Vista a griglia: quattro riquadri. */
  grid: (
    <>
      <rect x="2" y="2" width="4" height="4" />
      <rect x="10" y="2" width="4" height="4" />
      <rect x="2" y="10" width="4" height="4" />
      <rect x="10" y="10" width="4" height="4" />
    </>
  ),

  /** Vista a elenco: righe piene, una sotto l'altra. */
  list: (
    <>
      <path d="M2 4h12" />
      <path d="M2 8h12" />
      <path d="M2 12h12" />
    </>
  ),

  /** Apre altrove: la freccia in fuori e' la convenzione per "scheda nuova". */
  external: (
    <>
      <path d="M4 12 12 4" />
      <path d="M6 4h6v6" />
    </>
  ),

  /** Modifica: matita in diagonale. */
  edit: (
    <>
      <path d="M3 13v-3l7-7 3 3-7 7z" />
      <path d="M10 3l3 3" />
    </>
  ),

  /** Elimina: cestino con coperchio e manico. */
  trash: (
    <>
      <path d="M2 4h12" />
      <path d="M6 4V2h4v2" />
      <path d="M4 4v10h8V4" />
    </>
  ),

  /** Filtra: lente d'ingrandimento. */
  search: (
    <>
      <circle cx="7" cy="7" r="4" />
      <path d="M10 10l4 4" />
    </>
  ),

  /** Azzera, chiudi: croce. */
  close: (
    <>
      <path d="M3 3l10 10" />
      <path d="M13 3L3 13" />
    </>
  ),

  /** Aggiungi. */
  plus: (
    <>
      <path d="M8 3v10" />
      <path d="M3 8h10" />
    </>
  ),

  /** Account: testa e spalle, squadrate come tutto il resto. */
  user: (
    <>
      <circle cx="8" cy="5" r="3" />
      <path d="M3 14v-2l3-2h4l3 2v2" />
    </>
  ),

  /** Esci: si esce dal riquadro, verso destra. */
  exit: (
    <>
      <path d="M6 2H2v12h4" />
      <path d="M9 8h6" />
      <path d="M12 5l3 3-3 3" />
    </>
  ),

  /** Libreria: due pagine aperte. */
  books: (
    <>
      <path d="M2 3l6 2v9l-6-2z" />
      <path d="M14 3L8 5v9l6-2z" />
    </>
  ),

  /** Pagina precedente. */
  prev: (
    <>
      <path d="M14 8H2" />
      <path d="M6 4L2 8l4 4" />
    </>
  ),

  /** Pagina successiva. */
  next: (
    <>
      <path d="M2 8h12" />
      <path d="M10 4l4 4-4 4" />
    </>
  ),

  /** Contenuti visibili: un occhio squadrato, in tinta col resto del set. */
  eye: (
    <>
      <path d="M1 8l3-3h8l3 3-3 3H4z" />
      <path d="M6 8h4" />
    </>
  ),

  /** Contenuti nascosti: lo stesso occhio, sbarrato. */
  "eye-off": (
    <>
      <path d="M1 8l3-3h8l3 3-3 3H4z" />
      <path d="M2 2l12 12" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

export const Icon = ({
  name,
  className = "h-4 w-4 shrink-0",
}: {
  name: IconName;
  /** Sovrascrive la misura di default (16px). */
  className?: string;
}) => (
  <svg
    viewBox="0 0 16 16"
    // Un'icona accompagna sempre un'etichetta o un testo `sr-only`: leggerla
    // farebbe sentire due volte la stessa parola. Chi ha bisogno di un nome
    // accessibile lo mette accanto, non qui dentro.
    aria-hidden="true"
    focusable="false"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    // Spigoli vivi: `round` arrotonderebbe le estremita' e stonerebbe con i
    // bordi netti dei controlli.
    strokeLinecap="butt"
    strokeLinejoin="miter"
    className={className}
  >
    {ICONS[name]}
  </svg>
);
