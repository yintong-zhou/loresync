import type { FormState } from "@/lib/form-state";

/**
 * Esito di un form. `role="alert"` perche' il messaggio compare dopo
 * l'invio: chi usa uno screen reader deve sentirlo senza doverlo cercare, e
 * il colore da solo non e' un'informazione.
 */
export const FormMessage = ({ state }: { state: FormState }) => {
  if (state.status === "idle" || !state.message) return null;

  return (
    <p
      role="alert"
      className={`border-2 px-step-2 py-step-1 ${
        state.status === "error"
          ? "border-primary text-primary"
          : "border-secondary bg-accent"
      }`}
    >
      {state.message}
    </p>
  );
};
