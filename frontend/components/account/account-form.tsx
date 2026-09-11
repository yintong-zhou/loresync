"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { BUTTON_CLASS } from "@/components/ui/form-styles";
import { IDLE_FORM_STATE, type FormState } from "@/lib/form-state";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * Involucro delle tre sezioni dell'account (profilo, email, password).
 * I campi arrivano come `children` e vengono renderizzati dal server: qui
 * dentro c'e' solo cio' che ha bisogno di stato, cioe' l'esito e il pending.
 */
export const AccountForm = ({
  action,
  submitLabel,
  pendingLabel,
  children,
}: {
  action: Action;
  submitLabel: string;
  pendingLabel: string;
  children: React.ReactNode;
}) => {
  const [state, formAction, isPending] = useActionState(action, IDLE_FORM_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-step-2">
      {children}
      <FormMessage state={state} />
      <div>
        <button type="submit" disabled={isPending} className={BUTTON_CLASS}>
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
};
