import { Cover } from "@/components/manga/cover";
import { BUTTON_SM_CLASS, CHIP_SM_CLASS } from "@/components/ui/form-styles";
import { Icon } from "@/components/ui/icon";
import type { Dictionary } from "@/lib/i18n";
import { resolveReadingLink } from "@/lib/reading-link";
import type { MangaEntry } from "@/lib/types";

/**
 * Una serie nella vista a griglia.
 *
 * Qui si scorre e si riprende, non si gestisce: capitolo, stato, Modifica ed
 * Elimina restano nella vista a elenco. Ammucchiati sotto una copertina larga
 * un quarto di schermo si accavallerebbero, e raddoppierebbero l'altezza di
 * ogni scheda per controlli che si usano una volta ogni tanto.
 *
 * Server Component: nessuno stato: l'unico pezzo che ne ha e' `Cover`, che
 * gestisce da sola le copertine che non caricano.
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
    <li className="flex flex-col gap-step-1">
      {/* Il riquadro tiene il posto anche quando la copertina manca o non
          carica: `Cover` in quel caso non rende niente, e senza una cornice
          con un rapporto fisso la scheda si accorcerebbe sfasando la griglia. */}
      <div className="aspect-[2/3] w-full border-2 border-secondary bg-neutral-light">
        {entry.coverUrl ? (
          <Cover
            src={entry.coverUrl}
            // Decorativa: il titolo e' scritto sotto, e ripeterlo lo farebbe
            // leggere due volte a chi usa uno screen reader.
            alt=""
            // Riempie la cornice invece dei 150x225 fissi dell'elenco: in
            // griglia la larghezza la decide la colonna.
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

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
