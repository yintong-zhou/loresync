/**
 * Stato condiviso dei form gestiti da server action + `useActionState`.
 *
 * `message` e' gia' tradotto: la traduzione avviene nella action, che conosce
 * la lingua, cosi' il componente client non deve trasportare un dizionario.
 */
export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export const IDLE_FORM_STATE: FormState = { status: "idle" };

export const formError = (message: string): FormState => ({
  status: "error",
  message,
});

export const formSuccess = (message: string): FormState => ({
  status: "success",
  message,
});
