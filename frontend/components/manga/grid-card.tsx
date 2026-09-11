import { Cover } from "@/components/manga/cover";
import { DeleteEntry } from "@/components/manga/delete-entry";
import { EditEntryForm } from "@/components/manga/edit-entry-form";
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
 * le copertine che non caricano, e il pannello di modifica, che e' un
 * `details` e quindi lo tiene il browser.
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

      {/* Pannello di modifica.

          `pointer-events-none` sul contenitore e `auto` sui due pezzi che
          contano: chiuso, il `details` e' una fascia larga quanto la scheda
          alta trentadue pixel, e senza questo intercetterebbe i click su una
          striscia di copertina per niente.

          `z-20`: aperto, il pannello puo' superare l'altezza della scheda e
          finire sopra quelle della riga sotto. Senza, sarebbero loro a
          coprirlo, perche' a parita' di livello vince chi viene dopo. */}
      <details className="pointer-events-none absolute inset-x-0 top-0 z-20">
        {/* Le classi sono scritte qui e non prese da `BUTTON_ICON_SM_CLASS`
            perche' il pulsante dev'essere di livello blocco per potersi
            spingere a destra con `ml-auto`, e quella costante e' `inline-flex`.
            `list-none` e la regola webkit tolgono il triangolino: qui il
            comando e' l'icona, e un marcatore accanto sarebbe rumore. */}
        <summary className="pointer-events-auto ml-auto flex h-8 w-8 cursor-pointer list-none items-center justify-center border-2 border-secondary bg-neutral-light hover:border-primary hover:text-primary [&::-webkit-details-marker]:hidden">
          <Icon name="edit" />
          {/* Il nome del comando resta scritto, per chi non vede l'icona. */}
          <span className="sr-only">{labels.edit}</span>
        </summary>

        {/* Fondo pieno e bordo: aperto copre la copertina, e deve leggersi
            come un pannello posato sopra, non come testo sull'immagine. */}
        <div className="pointer-events-auto mt-step-1 flex flex-col gap-step-1 border-2 border-secondary bg-neutral-light p-step-1">
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
        </div>
      </details>

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
