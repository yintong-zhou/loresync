"use client";

import { useActionState, useState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import {
  BUTTON_GHOST_SM_CLASS,
  FIELD_SM_CLASS,
  LABEL_CLASS,
  TEXTAREA_CLASS,
} from "@/components/ui/form-styles";
import { Icon } from "@/components/ui/icon";
import { IDLE_FORM_STATE, type FormState } from "@/lib/form-state";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { MangaEntry } from "@/lib/types";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * Modifica in linea di link, tag e descrizione.
 *
 * Sta chiusa dentro un `<details>`: sono correzioni occasionali, e tenerle
 * sempre aperte raddoppierebbe l'altezza di ogni riga della libreria per un
 * campo che si tocca una volta ogni tanto.
 *
 * E' un Client Component perche' serve l'esito: cambiare il link puo'
 * scontrarsi con una serie gia' presente, e quel messaggio va mostrato.
 */
export const EditEntryForm = ({
  action,
  entry,
  locale,
  labels,
}: {
  action: Action;
  entry: MangaEntry;
  locale: Locale;
  labels: Dictionary["manga"];
}) => {
  const [state, formAction, isPending] = useActionState(action, IDLE_FORM_STATE);
  const [isOpen, setIsOpen] = useState(false);

  /**
   * A salvataggio riuscito la sezione si richiude: il lavoro e' finito, e la
   * card torna leggibile senza doverla chiudere a mano. In caso di errore
   * resta aperta, altrimenti il messaggio sparirebbe proprio quando serve.
   *
   * L'aggiustamento avviene in fase di render e non dentro un effetto: React
   * ripete subito il render senza passare dal browser, quindi il pannello non
   * si vede aperto per un istante prima di chiudersi.
   *
   * Il confronto e' sull'oggetto intero e non su `state.status`: ogni invio ne
   * restituisce uno nuovo, cosi' due salvataggi riusciti di fila chiudono
   * entrambe le volte.
   */
  const [seenState, setSeenState] = useState(state);
  if (seenState !== state) {
    setSeenState(state);
    if (state.status === "success") setIsOpen(false);
  }

  const panel = (
    <details
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="inline-flex h-8 cursor-pointer items-center gap-step-1 text-sm font-bold uppercase tracking-wide text-neutral-dark hover:text-primary">
        <Icon name="edit" />
        {labels.edit}
      </summary>

      <form action={formAction} className="mt-step-1 flex flex-col gap-step-1">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={entry.id} />

        <div>
          <label className={LABEL_CLASS} htmlFor={`seriesUrl-${entry.id}`}>
            {labels.seriesUrlLabel}
          </label>
          <input
            id={`seriesUrl-${entry.id}`}
            name="seriesUrl"
            type="url"
            required
            defaultValue={entry.seriesUrl}
            className={`mt-step-1 w-full ${FIELD_SM_CLASS}`}
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor={`tags-${entry.id}`}>
            {labels.tagsLabel}
          </label>
          <input
            id={`tags-${entry.id}`}
            name="tags"
            type="text"
            // Stessa forma che il campo si aspetta in scrittura: separati da
            // virgola, cosi' si modifica cio' che si legge.
            defaultValue={entry.tags.join(", ")}
            className={`mt-step-1 w-full ${FIELD_SM_CLASS}`}
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor={`description-${entry.id}`}>
            {labels.descriptionLabel}
          </label>

          {/* La descrizione salvata si corregge dov'e' scritta. Un campo vuoto
              sotto al testo in sola lettura obbligava a ricopiarla per
              cambiarne una parola, e serviva pure una casella a parte per
              cancellarla: qui svuotare il campo basta. */}
          <textarea
            id={`description-${entry.id}`}
            name="description"
            rows={3}
            maxLength={2000}
            defaultValue={entry.description ?? ""}
            className={`mt-step-1 text-sm ${TEXTAREA_CLASS}`}
          />
          <p className="mt-step-1 text-sm text-neutral-dark">
            {labels.descriptionEditHint}
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className={BUTTON_GHOST_SM_CLASS}
          >
            {isPending ? labels.pending : labels.save}
          </button>
        </div>
      </form>
    </details>
  );

  return (
    <div className="flex flex-col gap-step-1">
      {panel}
      {/* Fuori dal `details`: se stesse dentro, la conferma di salvataggio
          sparirebbe insieme al pannello che si richiude. */}
      <FormMessage state={state} />
    </div>
  );
};
