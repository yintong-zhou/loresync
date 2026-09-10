"use client";

import { useActionState, useState, useTransition } from "react";
import { Cover } from "@/components/manga/cover";
import { FormMessage } from "@/components/ui/form-message";
import {
  FIELD_CLASS,
  HINT_CLASS,
  LABEL_CLASS,
  BUTTON_CLASS,
  TEXTAREA_CLASS,
} from "@/components/ui/form-styles";
import { IDLE_FORM_STATE, type FormState } from "@/lib/form-state";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { READING_STATUSES } from "@/lib/types";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

type Fetched = {
  title: string;
  description?: string;
  coverUrl?: string;
  chapterHint: number | null;
};

export const MangaForm = ({
  action,
  locale,
  labels,
  statusLabels,
}: {
  action: Action;
  locale: Locale;
  labels: Dictionary["manga"];
  statusLabels: Dictionary["readingStatus"];
}) => {
  const [state, formAction, isSubmitting] = useActionState(
    action,
    IDLE_FORM_STATE,
  );

  const [seriesUrl, setSeriesUrl] = useState("");
  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  // L'immagine puo' non caricare (link morto, hotlink bloccato): in quel caso
  // si nasconde l'anteprima invece di lasciare l'icona di immagine rotta.
  const [coverBroken, setCoverBroken] = useState(false);
  const [chapterHint, setChapterHint] = useState<number | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLooking, startLookup] = useTransition();

  /**
   * Chiede il titolo all'API quando il link e' completo.
   * L'estrazione non deve mai bloccare l'inserimento: se fallisce si mostra
   * un avviso e il campo titolo resta compilabile a mano.
   */
  const lookup = (url: string) => {
    if (!url.trim()) return;

    startLookup(async () => {
      setLookupError(null);
      try {
        const response = await fetch("/api/metadata", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          setLookupError(labels.lookupFailed);
          return;
        }

        const data = (await response.json()) as Fetched;
        // Il titolo e' obbligatorio e senza estrazione andrebbe scritto a
        // mano: si compila da solo, ma non sovrascrive quello gia' digitato.
        setTitle((current) => (current.trim() ? current : data.title));

        // La descrizione non si compila da sola: e' un campo facoltativo, e
        // riempirlo al posto dell'utente significa fargli salvare un testo che
        // non ha scelto ne' letto. Vale lo stesso per capitolo, tag e link del
        // capitolo, che restano vuoti per la stessa ragione.
        setCoverUrl(data.coverUrl ?? "");
        setCoverBroken(false);
        setChapterHint(data.chapterHint);
      } catch {
        setLookupError(labels.lookupFailed);
      }
    });
  };

  return (
    <form action={formAction} className="flex flex-col gap-step-2">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label className={LABEL_CLASS} htmlFor="seriesUrl">
          {labels.seriesUrlLabel}
        </label>
        <input
          id="seriesUrl"
          name="seriesUrl"
          type="url"
          required
          inputMode="url"
          value={seriesUrl}
          onChange={(event) => setSeriesUrl(event.target.value)}
          onBlur={(event) => lookup(event.target.value)}
          className={`mt-step-1 ${FIELD_CLASS}`}
        />
        <p className={HINT_CLASS}>
          {isLooking ? labels.lookupPending : labels.seriesUrlHint}
        </p>
        {lookupError ? (
          <p role="status" className={`${HINT_CLASS} text-primary`}>
            {lookupError}
          </p>
        ) : null}
      </div>

      {/* La copertina non e' un campo compilabile: e' cio' che il sito
          pubblica. Resta in un campo nascosto, e viene rivalidata dalla
          server action perche' il browser puo' averla modificata. */}
      <input type="hidden" name="coverUrl" value={coverUrl} />

      {coverUrl && !coverBroken ? (
        <div className="flex items-start gap-step-2">
          <Cover
            src={coverUrl}
            alt=""
            onBroken={() => setCoverBroken(true)}
          />
          <p className={HINT_CLASS}>{labels.coverFound}</p>
        </div>
      ) : null}

      <div>
        <label className={LABEL_CLASS} htmlFor="title">
          {labels.titleLabel}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={300}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={`mt-step-1 ${FIELD_CLASS}`}
        />
        <p className={HINT_CLASS}>{labels.titleHint}</p>
      </div>

      <div className="grid grid-cols-12 gap-step-2">
        <div className="col-span-12 md:col-span-4">
          <label className={LABEL_CLASS} htmlFor="currentChapter">
            {labels.chapterLabel}
          </label>
          <input
            id="currentChapter"
            name="currentChapter"
            type="text"
            inputMode="decimal"
            className={`mt-step-1 ${FIELD_CLASS}`}
          />
          {/* Suggerimento, non compilazione automatica: chi incolla il link
              del capitolo 40 puo' essere arrivato al 38. */}
          {chapterHint !== null ? (
            <p className={HINT_CLASS}>
              {labels.chapterHint} {chapterHint}
            </p>
          ) : null}
        </div>

        <div className="col-span-12 md:col-span-8">
          <label className={LABEL_CLASS} htmlFor="status">
            {labels.statusLabel}
          </label>
          <select
            id="status"
            name="status"
            defaultValue="in_corso"
            className={`mt-step-1 ${FIELD_CLASS}`}
          >
            {READING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="chapterUrl">
          {labels.chapterUrlLabel}
        </label>
        <input
          id="chapterUrl"
          name="chapterUrl"
          type="url"
          inputMode="url"
          className={`mt-step-1 ${FIELD_CLASS}`}
        />
        <p className={HINT_CLASS}>{labels.chapterUrlHint}</p>
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="tags">
          {labels.tagsLabel}
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          className={`mt-step-1 ${FIELD_CLASS}`}
        />
        <p className={HINT_CLASS}>{labels.tagsHint}</p>
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="description">
          {labels.descriptionLabel}
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          // Non controllata: nessuno la scrive al posto dell'utente, quindi
          // non c'e' niente da tenere in stato.
          className={`mt-step-1 ${TEXTAREA_CLASS}`}
        />
        <p className={HINT_CLASS}>{labels.descriptionHint}</p>
      </div>

      <FormMessage state={state} />

      <div>
        <button type="submit" disabled={isSubmitting} className={BUTTON_CLASS}>
          {isSubmitting ? labels.pending : labels.submit}
        </button>
      </div>
    </form>
  );
};
