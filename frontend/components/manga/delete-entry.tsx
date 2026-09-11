import { BUTTON_DANGER_SM_CLASS } from "@/components/ui/form-styles";
import { Icon } from "@/components/ui/icon";
import { deleteEntry } from "@/lib/manga/actions";
import type { Dictionary } from "@/lib/i18n";
import type { MangaEntry } from "@/lib/types";

/**
 * Eliminazione con conferma a due click, senza JavaScript: il primo apre il
 * `details`, il secondo esegue. Una cancellazione non deve stare a un click
 * solo, e una finestra di conferma richiederebbe codice nel browser per una
 * cosa che l'HTML sa gia' fare.
 *
 * Condivisa dalle due viste, come `ProgressForm`: cambia solo se il pulsante
 * di conferma occupa tutta la larghezza.
 */
export const DeleteEntry = ({
  entry,
  labels,
  full = false,
}: {
  entry: MangaEntry;
  labels: Dictionary["manga"];
  /** Conferma a tutta larghezza, per il pannello stretto della griglia. */
  full?: boolean;
}) => (
  <details className={full ? "" : "shrink-0"}>
    {/* `h-8` come gli altri controlli: senza, il testo del summary starebbe
        piu' in alto e romperebbe l'allineamento della riga. */}
    <summary className="inline-flex h-8 cursor-pointer items-center gap-step-1 text-sm font-bold uppercase tracking-wide text-neutral-dark hover:text-primary">
      <Icon name="trash" />
      {labels.delete}
    </summary>
    <form action={deleteEntry} className="mt-step-1">
      <input type="hidden" name="id" value={entry.id} />
      <button
        type="submit"
        className={`${full ? "w-full" : ""} ${BUTTON_DANGER_SM_CLASS}`}
      >
        {labels.deleteConfirm}
      </button>
    </form>
  </details>
);
