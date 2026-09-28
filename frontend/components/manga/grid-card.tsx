import { Cover } from "@/components/manga/cover";
import { DeleteEntry } from "@/components/manga/delete-entry";
import { EditEntryForm } from "@/components/manga/edit-entry-form";
import { GridEditPanel } from "@/components/manga/grid-edit-panel";
import { ProgressForm } from "@/components/manga/progress-form";
import { BUTTON_SM_CLASS, CHIP_SM_CLASS } from "@/components/ui/form-styles";
import { Icon } from "@/components/ui/icon";
import { updateDetails } from "@/lib/manga/actions";
import type { Dictionary } from "@/lib/i18n";
import { resolveReadingLink } from "@/lib/reading-link";
import type { MangaEntry } from "@/lib/types";

/**
 * Una serie nella vista a griglia.
 *
 * Qui si scorre e si riprende. Si modifica anche, ma da un pannello che sta
 * **sopra** la scheda invece che sotto: i controlli in colonna sotto una
 * copertina larga un quarto di schermo raddoppierebbero l'altezza di ogni
 * riquadro per cose che si toccano una volta ogni tanto, e la griglia — che
 * serve a vedere molte copertine insieme — smetterebbe di essere una griglia.
 *
 * Il pannello e' in posizione assoluta, quindi aprirlo non sposta di un pixel
 * nulla di quel che c'e' attorno: le altre schede restano dove sono, e
 * richiudendolo si torna esattamente a prima.
 *
 * Gli stessi controlli dell'elenco, non copie: `ProgressForm`, `EditEntryForm`
 * e `DeleteEntry` sono condivisi, cosi' le due viste non possono divergere.
 *
 * Server Component: nessuno stato. Lo stato ce l'hanno `Cover`, che gestisce
 * le copertine che non caricano, e `GridEditPanel`, che apre e chiude il
 * pannello di modifica.
 */
export const GridCard = ({
  entry,
  labels,
  statusLabels,
}: {
  entry: MangaEntry;
  labels: Dictionary["manga"];
  statusLabels: Dictionary["readingStatus"];
}) => {
  const link = resolveReadingLink(entry);

  return (
    // `relative`: e' il riferimento del pannello di modifica.
    <li className="relative flex flex-col gap-step-1">
      {/* Il riquadro tiene il posto anche quando la copertina manca o non
          carica: `Cover` in quel caso non rende niente, e senza una cornice
          con un rapporto fisso la scheda si accorcerebbe sfasando la griglia.

          `shrink-0` e' quello che rende tutte le copertine uguali. Le schede
          di una riga sono alte quanto la piu' alta, e in una colonna flex il
          contenuto in eccesso si toglie restringendo i figli: dove il titolo
          occupava tre righe invece di una, a cedere era il riquadro della
          copertina, che perdeva in altezza restando largo uguale. Il rapporto
          2:3 non bastava, perche' `aspect-ratio` cede davanti a un'altezza
          imposta dal flex.

          `relative` + `overflow-hidden` sono l'altra meta': `aspect-ratio`
          fissa l'altezza preferita, non un massimo, e un'immagine piu'
          allungata di 2:3 (760x1200, cioe' 0.63) se lo allargava di una
          quindicina di pixel. Quelle poche schede risultavano piu' grandi
          delle altre, che al confronto sembravano rimpicciolite. Sfilando
          l'immagine dal flusso il riquadro torna a dipendere solo dal
          rapporto. */}
      <div className="relative aspect-[2/3] w-full shrink-0 overflow-hidden border-2 border-secondary bg-neutral-light">
        {entry.coverUrl ? (
          <Cover
            src={entry.coverUrl}
            // Decorativa: il titolo e' scritto sotto, e ripeterlo lo farebbe
            // leggere due volte a chi usa uno screen reader.
            alt=""
            // Riempie la cornice invece dei 150x225 fissi dell'elenco: in
            // griglia la larghezza la decide la colonna. In posizione
            // assoluta: cosi' e' la cornice a imporre la misura
            // all'immagine, e mai il contrario.
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
      </div>

      {/* Pannello di modifica: si chiude da solo quando si salva il
          capitolo, vedi `GridEditPanel`. */}
      <GridEditPanel label={labels.edit}>
        <ProgressForm
          entry={entry}
          labels={labels}
          statusLabels={statusLabels}
          // In colonna: nel pannello stretto tre controlli in fila
          // finirebbero larghi una parola ciascuno.
          layout="stack"
        />

        <EditEntryForm
          action={updateDetails}
          entry={entry}
          labels={labels}
        />

        <DeleteEntry entry={entry} labels={labels} full />
      </GridEditPanel>

      <div>
        {/* `break-words`: in colonna stretta un titolo senza spazi sfonderebbe
            la cella invece di andare a capo. */}
        <h2 className="break-words text-base uppercase leading-tight md:text-lg">
          {entry.title}
        </h2>
        <p className="text-sm uppercase tracking-wide text-neutral-dark">
          {entry.currentChapter !== null
            ? `${labels.chapterShort} ${entry.currentChapter} · `
            : ""}
          {statusLabels[entry.status]}
        </p>
      </div>

      {/* `mt-auto` incolla il pulsante in fondo: le schede di una riga hanno
          titoli di altezza diversa, e senza, i pulsanti sarebbero a quote
          diverse. */}
      <div className="mt-auto">
        {link ? (
          <a
            href={link.href}
            target="_blank"
            // Link diretto alla piattaforma, mai un redirect interno.
            rel="noopener noreferrer"
            className={`w-full ${BUTTON_SM_CLASS}`}
          >
            {/* La freccia in fuori dice che si esce dal sito: il link porta
                alla piattaforma di lettura, in una scheda nuova. */}
            <Icon name="external" />
            {link.kind === "chapter" ? labels.resumeChapter : labels.openSeries}
          </a>
        ) : (
          <span className={`w-full ${CHIP_SM_CLASS}`}>{labels.noValidLink}</span>
        )}
      </div>
    </li>
  );
};
