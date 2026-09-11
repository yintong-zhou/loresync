/**
 * Classi dei controlli: campi, menu a tendina e pulsanti.
 *
 * Il problema che risolvono e' l'allineamento. Un pulsante con solo sfondo e
 * un campo con `border-2` non hanno la stessa altezza: il bordo aggiunge 4px,
 * e affiancati risultano sfalsati. Qui ogni controllo ha **lo stesso bordo**
 * (colorato o in tinta con lo sfondo) e **un'altezza fissa**, cosi' input,
 * select e button messi in fila combaciano sempre, qualunque sia il contenuto.
 *
 * Due sole misure, entrambe multipli di 8 come da brand-guidelines.md:
 * - `md` (40px) per i form veri, dove si scrive;
 * - `sm` (32px) per i controlli in linea nella lista e nei filtri.
 */

const HEIGHT_MD = "h-10"; // 40px
const HEIGHT_SM = "h-8"; // 32px

/** Bordo e interlinea condivisi: sono questi a garantire l'altezza uguale. */
const BOX = "border-2 leading-none";

/**
 * Pulsanti ed etichette: sempre in maiuscolo, come da tono del brand.
 * Il `gap` stacca l'icona dal testo quando c'e'; sui pulsanti di solo testo
 * non ha alcun effetto, perche' il contenuto e' uno solo.
 */
const LABELLED = "inline-flex items-center justify-center gap-step-1 font-bold uppercase tracking-wide";

/**
 * Campo di testo a piena larghezza.
 * `text-base` non e' estetica: sotto i 16px iOS ingrandisce la pagina da solo
 * quando il campo riceve il fuoco.
 */
export const FIELD_CLASS = `${HEIGHT_MD} w-full ${BOX} border-secondary bg-neutral-light px-step-2 text-base`;

/** Variante stretta per i controlli in linea (lista, barra dei filtri). */
export const FIELD_SM_CLASS = `${HEIGHT_SM} ${BOX} border-secondary bg-neutral-light px-step-1 text-sm`;

/**
 * Tendine i cui valori sono etichette nostre — stato di lettura, tag,
 * ordinamento — e non testo scritto dall'utente: vanno in maiuscolo come le
 * altre etichette dell'interfaccia, mentre un campo di ricerca resta com'e'
 * scritto.
 *
 * Il maiuscolo va messo anche su ogni `<option>`, con `OPTION_CLASS`: non
 * tutti i browser propagano `text-transform` dalla tendina alla lista che si
 * apre, e senza si vedrebbe la voce scelta in maiuscolo e le alternative no.
 */
export const SELECT_CLASS = `${FIELD_CLASS} uppercase tracking-wide`;

export const SELECT_SM_CLASS = `${FIELD_SM_CLASS} uppercase tracking-wide`;

export const OPTION_CLASS = "uppercase";

/** La textarea cresce in altezza: unico controllo senza altezza fissa. */
export const TEXTAREA_CLASS = `w-full ${BOX} border-secondary bg-neutral-light px-step-2 py-step-1 text-base`;

/** Azione principale. Il bordo e' dello stesso colore dello sfondo: serve
 *  solo a pareggiare l'altezza dei campi accanto. */
export const BUTTON_CLASS = `${HEIGHT_MD} ${BOX} ${LABELLED} border-primary bg-primary px-step-3 text-neutral-light hover:border-secondary hover:bg-secondary disabled:opacity-60`;

export const BUTTON_SM_CLASS = `${HEIGHT_SM} ${BOX} ${LABELLED} border-primary bg-primary px-step-2 text-sm text-neutral-light hover:border-secondary hover:bg-secondary disabled:opacity-60`;

/**
 * Pulsanti di sola icona: quadrati, senza l'imbottitura laterale che serve al
 * testo. Non si ottengono sovrascrivendo il padding di `BUTTON_SM_CLASS`,
 * perche' fra due classi Tailwind della stessa proprieta' vince quella scritta
 * dopo nel foglio di stile, non quella scritta dopo nell'attributo.
 */
export const BUTTON_ICON_SM_CLASS = `${HEIGHT_SM} w-8 ${BOX} ${LABELLED} border-primary bg-primary text-neutral-light hover:border-secondary hover:bg-secondary`;

export const BUTTON_ICON_GHOST_SM_CLASS = `${HEIGHT_SM} w-8 ${BOX} ${LABELLED} border-secondary hover:border-primary hover:text-primary`;

/** Azione secondaria: stesso ingombro, nessun riempimento. */
export const BUTTON_GHOST_CLASS = `${HEIGHT_MD} ${BOX} ${LABELLED} border-secondary px-step-2 hover:border-primary hover:text-primary`;

export const BUTTON_GHOST_SM_CLASS = `${HEIGHT_SM} ${BOX} ${LABELLED} border-secondary px-step-2 text-sm hover:border-primary hover:text-primary`;

/** Azione distruttiva: si riempie di rosso solo al passaggio del mouse. */
export const BUTTON_DANGER_SM_CLASS = `${HEIGHT_SM} ${BOX} ${LABELLED} border-primary px-step-2 text-sm text-primary hover:bg-primary hover:text-neutral-light`;

/** Elemento non interattivo che deve stare in fila con i controlli. */
export const CHIP_SM_CLASS = `${HEIGHT_SM} ${BOX} inline-flex items-center border-neutral-light px-step-2 text-sm uppercase tracking-wide text-neutral-dark`;

/**
 * Tag di una serie.
 *
 * Stessa forma del chip ma con il bordo nero degli altri controlli. Col bordo
 * in tinta con lo sfondo della pagina i tag erano testo maiuscolo in mezzo ad
 * altro testo maiuscolo — la riga con host, capitolo e stato ha lo stesso
 * corpo e lo stesso colore — e si perdevano nella card. Il bordo e' quello che
 * li rende cose contate, invece che una frase.
 *
 * Nero e non giallo: su fondo chiaro l'accento si vedrebbe di piu', ma una
 * serie puo' averne venti, e venti riquadri gialli in una libreria non sono
 * piu' un accento.
 */
export const TAG_SM_CLASS = `${HEIGHT_SM} ${BOX} inline-flex items-center border-secondary px-step-2 text-sm uppercase tracking-wide text-secondary`;

export const LABEL_CLASS = "block text-sm font-bold uppercase tracking-wide";

export const HINT_CLASS = "mt-step-1 max-w-prose text-sm text-neutral-dark";
