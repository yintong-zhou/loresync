import { Cover } from "@/components/manga/cover";
import { DeleteEntry } from "@/components/manga/delete-entry";
import { EditEntryForm } from "@/components/manga/edit-entry-form";
import { ProgressForm } from "@/components/manga/progress-form";
import {
  BUTTON_SM_CLASS,
  CHIP_SM_CLASS,
  TAG_SM_CLASS,
} from "@/components/ui/form-styles";
import { Icon } from "@/components/ui/icon";
import { updateDetails } from "@/lib/manga/actions";
import type { Dictionary } from "@/lib/i18n";
import { resolveReadingLink } from "@/lib/reading-link";
import type { MangaEntry } from "@/lib/types";

export const MangaCard = ({
  entry,
  labels,
  statusLabels,
}: {
  entry: MangaEntry;
  labels: Dictionary["manga"];
  statusLabels: Dictionary["readingStatus"];
}) => {
  const link = resolveReadingLink(entry);
  const host = (() => {
    try {
      return new URL(entry.seriesUrl).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  return (
    // La spaziatura verticale sta tutta qui: le righe si separano da sole con
    // il bordo e un padding solo, senza margini sui figli che si sommerebbero.
    <article className="flex gap-step-2 border-t-2 border-secondary py-step-2">
      {entry.coverUrl ? (
        <Cover
          src={entry.coverUrl}
          // Decorativa: il titolo e' scritto accanto, ripeterlo lo farebbe
          // leggere due volte a chi usa uno screen reader.
          alt=""
        />
      ) : null}

      {/* Colonna del testo: `min-w-0` perche' senza, un titolo lungo
          sfonderebbe il flex invece di andare a capo. */}
      <div className="flex min-w-0 flex-1 flex-col gap-step-1">
        <div>
          <h2 className="text-xl uppercase leading-tight md:text-2xl">
            {entry.title}
          </h2>
          <p className="text-sm uppercase tracking-wide text-neutral-dark">
            {host}
            {entry.currentChapter !== null
              ? ` · ${labels.chapterShort} ${entry.currentChapter}`
              : ""}
            {` · ${statusLabels[entry.status]}`}
          </p>
        </div>

        {entry.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-step-1">
            {entry.tags.map((tag) => (
              <li
                key={tag}
                className={TAG_SM_CLASS}
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {link?.stale ? (
          <p className="text-sm text-primary">{labels.staleLink}</p>
        ) : null}

        {/* Controlli in una riga sola: capitolo e stato si aggiornano
            insieme, con un pulsante solo. `mt-auto` li appoggia in fondo,
            cosi' la riga e' alta quanto la copertina e non di piu'. */}
        <div className="mt-auto flex flex-wrap items-center gap-step-1">
          {link ? (
            <a
              href={link.href}
              target="_blank"
              // Link diretto alla piattaforma, mai un redirect interno.
              rel="noopener noreferrer"
              className={BUTTON_SM_CLASS}
            >
              {/* La freccia in fuori dice che si esce dal sito. */}
              <Icon name="external" />
              {link.kind === "chapter" ? labels.resumeChapter : labels.openSeries}
            </a>
          ) : (
            <span className={CHIP_SM_CLASS}>
              {labels.noValidLink}
            </span>
          )}

          <ProgressForm
            entry={entry}
            labels={labels}
            statusLabels={statusLabels}
          />
        </div>

        {/* Correzioni occasionali: link, tag e descrizione stanno chiusi, e
            aperti prendono tutta la larghezza della colonna. */}
        <div className="flex items-start gap-step-2">
          <div className="min-w-0 flex-1">
            <EditEntryForm
              action={updateDetails}
              entry={entry}
              labels={labels}
            />
          </div>

          <DeleteEntry entry={entry} labels={labels} />
        </div>
      </div>
    </article>
  );
};
