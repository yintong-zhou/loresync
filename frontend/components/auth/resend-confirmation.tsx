"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import {
  BUTTON_GHOST_CLASS,
  FIELD_CLASS,
  LABEL_CLASS,
} from "@/components/ui/form-styles";
import { IDLE_FORM_STATE, type FormState } from "@/lib/form-state";
import type { Dictionary } from "@/lib/i18n";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * Reinvio dell'email di conferma.
 *
 * Sezione a se' e non un link attaccato al messaggio "controlla la posta":
 * il caso vero e' tornare qui giorni dopo con l'email persa o il token
 * scaduto, non premere un pulsante subito dopo la registrazione. E' anche
 * dove atterra `/auth/callback` quando il link non vale piu' (`?error=link`).
 *
 * Chiusa in un `<details>`: serve a pochi e in un momento preciso, e aperta
 * metterebbe un secondo campo email sotto quello del login, cioe' due caselle
 * uguali una sopra l'altra.
 */
export const ResendConfirmation = ({
  action,
  labels,
}: {
  action: Action;
  labels: Dictionary["auth"];
}) => {
  const [state, formAction, isPending] = useActionState(action, IDLE_FORM_STATE);

  return (
    <details className="mt-step-3 border-t-2 border-secondary pt-step-2">
      <summary className="cursor-pointer text-sm font-bold uppercase tracking-wide text-neutral-dark hover:text-primary">
        {labels.resendTitle}
      </summary>
      <form action={formAction} className="mt-step-2 flex flex-col gap-step-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="resendEmail">
            {labels.emailLabel}
          </label>
          <input
            id="resendEmail"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`mt-step-1 ${FIELD_CLASS}`}
          />
        </div>

        <FormMessage state={state} />

        <div>
          <button
            type="submit"
            disabled={isPending}
            // `BUTTON_GHOST_CLASS` non prevede lo stato disabilitato: e' l'unico
            // pulsante fantasma che puo' esserlo, quindi la sfumatura sta qui
            // e non nel token condiviso.
            className={`${BUTTON_GHOST_CLASS} disabled:opacity-60`}
          >
            {isPending ? labels.pending : labels.resendCta}
          </button>
        </div>
      </form>
    </details>
  );
};
