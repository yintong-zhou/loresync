import { Cover } from "@/components/manga/cover";
import { EditEntryForm } from "@/components/manga/edit-entry-form";
import {
  BUTTON_DANGER_SM_CLASS,
  BUTTON_GHOST_SM_CLASS,
  BUTTON_SM_CLASS,
  CHIP_SM_CLASS,
  FIELD_SM_CLASS,
} from "@/components/ui/form-styles";
import {
  deleteEntry,
  updateDetails,
  updateProgress,
} from "@/lib/manga/actions";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { resolveReadingLink } from "@/lib/reading-link";
import { READING_STATUSES, type MangaEntry } from "@/lib/types";

export const MangaCard = ({
  entry,
  locale,
  labels,
  statusLabels,
}: {
  entry: MangaEntry;
  locale: Locale;
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
                className={CHIP_SM_CLASS}
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
              {link.kind === "chapter" ? labels.resumeChapter : labels.openSeries}
            </a>
          ) : (
            <span className={CHIP_SM_CLASS}>
              {labels.noValidLink}
            </span>
          )}

          <form
            action={updateProgress}
            className="flex flex-wrap items-center gap-step-1"
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={entry.id} />

            {/* Etichette per chi usa uno screen reader, senza occupare
                una riga a schermo. */}
            <label className="sr-only" htmlFor={`chapter-${entry.id}`}>
              {labels.chapterLabel}
            </label>
            <input
              id={`chapter-${entry.id}`}
              name="currentChapter"
              type="text"
              inputMode="decimal"
              defaultValue={entry.currentChapter ?? ""}
              aria-label={labels.chapterLabel}
              className={`w-16 ${FIELD_SM_CLASS}`}
            />

            <label className="sr-only" htmlFor={`status-${entry.id}`}>
              {labels.statusLabel}
            </label>
            <select
              id={`status-${entry.id}`}
              name="status"
              defaultValue={entry.status}
              className={FIELD_SM_CLASS}
            >
              {READING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>

            <button type="submit" className={BUTTON_GHOST_SM_CLASS}>
              {labels.save}
            </button>
          </form>

        </div>

        {/* Correzioni occasionali: link, tag e descrizione stanno chiusi, e
            aperti prendono tutta la larghezza della colonna. */}
        <div className="flex items-start gap-step-2">
          <div className="min-w-0 flex-1">
            <EditEntryForm
              action={updateDetails}
              entry={entry}
              locale={locale}
              labels={labels}
            />
          </div>

          {/* Conferma senza JavaScript: il primo click apre, il secondo
              elimina. Una cancellazione non deve stare a un click solo. */}
          <details className="shrink-0">
            {/* `h-8` come gli altri controlli: senza, il testo del summary
                starebbe piu' in alto e romperebbe l'allineamento della riga. */}
            <summary className="inline-flex h-8 cursor-pointer items-center text-sm font-bold uppercase tracking-wide text-neutral-dark hover:text-primary">
              {labels.delete}
            </summary>
            <form action={deleteEntry} className="mt-step-1">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="id" value={entry.id} />
              <button
                type="submit"
                className={BUTTON_DANGER_SM_CLASS}
              >
                {labels.deleteConfirm}
              </button>
            </form>
          </details>
        </div>
      </div>
    </article>
  );
};
