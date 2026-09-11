import {
  BUTTON_GHOST_SM_CLASS,
  FIELD_SM_CLASS,
  OPTION_CLASS,
  SELECT_SM_CLASS,
} from "@/components/ui/form-styles";
import { updateProgress } from "@/lib/manga/actions";
import type { Dictionary } from "@/lib/i18n";
import { READING_STATUSES, type MangaEntry } from "@/lib/types";

/**
 * Capitolo e stato: l'aggiornamento di tutti i giorni.
 *
 * Sono due campi ma un solo form, perche' si aggiornano insieme ("sono al 39,
 * e l'ho messo in pausa"): due pulsanti Salva a un centimetro di distanza
 * sarebbero stati solo un'occasione di sbagliare.
 *
 * Vive qui e non dentro la card perche' lo usano entrambe le viste: in elenco
 * in fila accanto a "Riprendi", in griglia impilato dentro il pannello che si
 * apre sulla copertina. Cambia la disposizione, non cio' che fa.
 */
export const ProgressForm = ({
  entry,
  labels,
  statusLabels,
  layout = "row",
}: {
  entry: MangaEntry;
  labels: Dictionary["manga"];
  statusLabels: Dictionary["readingStatus"];
  /** `row` sta in fila con gli altri controlli, `stack` incolonna a tutta larghezza. */
  layout?: "row" | "stack";
}) => {
  const stacked = layout === "stack";

  return (
    <form
      // Rimonta il form quando capitolo o stato cambiano sul server.
      //
      // I due campi sono non controllati, e `defaultValue` decide il valore
      // solo al montaggio: cambiandolo dopo, React non tocca il nodo gia' in
      // pagina. Al termine dell'azione il form viene reimpostato — e finiva
      // sul valore di partenza del nodo, cioe' quello di prima del
      // salvataggio. Si vedeva la riga sopra la card aggiornarsi e la tendina
      // no, come se il cambio non fosse passato.
      //
      // Con la chiave legata ai dati il nodo e' un altro, `defaultValue` viene
      // riletto, e i campi ripartono da cio' che e' stato salvato davvero.
      // Vale anche per il capitolo, che a "da leggere" il server porta a zero
      // senza che nessuno l'abbia scritto nella casella.
      key={`${entry.status}:${entry.currentChapter ?? ""}`}
      action={updateProgress}
      className={
        stacked
          ? "flex flex-col gap-step-1"
          : "flex flex-wrap items-center gap-step-1"
      }
    >
      <input type="hidden" name="id" value={entry.id} />

      {/* Etichette per chi usa uno screen reader, senza occupare una riga a
          schermo: il campo del capitolo e' largo due cifre e una scritta
          sopra raddoppierebbe l'altezza della riga. */}
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
        placeholder={stacked ? labels.chapterLabel : undefined}
        className={`${stacked ? "w-full" : "w-16"} ${FIELD_SM_CLASS}`}
      />

      <label className="sr-only" htmlFor={`status-${entry.id}`}>
        {labels.statusLabel}
      </label>
      <select
        id={`status-${entry.id}`}
        name="status"
        defaultValue={entry.status}
        className={`${stacked ? "w-full" : ""} ${SELECT_SM_CLASS}`}
      >
        {READING_STATUSES.map((status) => (
          <option className={OPTION_CLASS} key={status} value={status}>
            {statusLabels[status]}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className={`${stacked ? "w-full" : ""} ${BUTTON_GHOST_SM_CLASS}`}
      >
        {labels.save}
      </button>
    </form>
  );
};
