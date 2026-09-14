import { AccountForm } from "@/components/account/account-form";
import {
  BUTTON_DANGER_CLASS,
  FIELD_CLASS,
  HINT_CLASS,
  LABEL_CLASS,
} from "@/components/ui/form-styles";
import { Icon } from "@/components/ui/icon";
import type { Dictionary } from "@/lib/i18n";
import type { FormState } from "@/lib/form-state";

/**
 * Chiusura dell'account, con la stessa conferma a due click di `DeleteEntry`:
 * il primo apre il `details`, il secondo esegue. Qui pero' il secondo click
 * non basta da solo, perche' il danno non e' una riga ma tutta la libreria: in
 * mezzo c'e' la password, che la action riverifica contro Supabase.
 *
 * Il `details` tiene il modulo chiuso finche' non lo si cerca: una sezione
 * sempre aperta con dentro un campo password, in fondo alla pagina
 * dell'account, e' un invito a sbagliare bersaglio.
 */
export const DeleteAccount = ({
  action,
  labels,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  labels: Dictionary["account"];
}) => (
  <>
    <p className={`${HINT_CLASS} mt-0 mb-step-2`}>{labels.deleteWarning}</p>
    <details>
      <summary className="inline-flex h-8 cursor-pointer items-center gap-step-1 text-sm font-bold uppercase tracking-wide text-neutral-dark hover:text-primary">
        <Icon name="trash" />
        {labels.deleteCta}
      </summary>
      <div className="mt-step-2">
        <AccountForm
          action={action}
          submitLabel={labels.deleteConfirm}
          pendingLabel={labels.pending}
          buttonClass={BUTTON_DANGER_CLASS}
        >
          <div>
            <label className={LABEL_CLASS} htmlFor="deletePassword">
              {labels.deletePasswordLabel}
            </label>
            <input
              id="deletePassword"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={`mt-step-1 ${FIELD_CLASS}`}
            />
          </div>
        </AccountForm>
      </div>
    </details>
  </>
);
