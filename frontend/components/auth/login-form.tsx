"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { IDLE_FORM_STATE, type FormState } from "@/lib/form-state";
import { FormMessage } from "@/components/ui/form-message";
import {
  FIELD_CLASS,
  HINT_CLASS,
  LABEL_CLASS,
  BUTTON_CLASS,
} from "@/components/ui/form-styles";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

export const LoginForm = ({
  action,
  mode,
  locale,
  next,
  labels,
}: {
  action: Action;
  mode: "signin" | "signup";
  locale: Locale;
  next: string | null;
  labels: Dictionary["auth"];
}) => {
  const [state, formAction, isPending] = useActionState(action, IDLE_FORM_STATE);
  const isSignUp = mode === "signup";

  return (
    <form action={formAction} className="flex flex-col gap-step-2">
      {/* La lingua viaggia col form: la server action non ha accesso ai
          params di rotta. Viene comunque rivalidata lato server. */}
      <input type="hidden" name="locale" value={locale} />
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {isSignUp ? (
        <div>
          <label className={LABEL_CLASS} htmlFor="displayName">
            {labels.displayNameLabel}
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="nickname"
            minLength={2}
            maxLength={60}
            className={`mt-step-1 ${FIELD_CLASS}`}
          />
          <p className={HINT_CLASS}>
            {labels.displayNameHint}
          </p>
        </div>
      ) : null}

      <div>
        <label className={LABEL_CLASS} htmlFor="email">
          {labels.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={`mt-step-1 ${FIELD_CLASS}`}
        />
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="password">
          {labels.passwordLabel}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          // Il browser propone una password nuova solo se sa che e' una
          // registrazione: con `current-password` offrirebbe quelle salvate.
          autoComplete={isSignUp ? "new-password" : "current-password"}
          className={`mt-step-1 ${FIELD_CLASS}`}
        />
        {isSignUp ? (
          <p className={HINT_CLASS}>
            {labels.passwordHint}
          </p>
        ) : null}
      </div>

      <FormMessage state={state} />

      <button type="submit" disabled={isPending} className={BUTTON_CLASS}>
        {isPending
          ? labels.pending
          : isSignUp
            ? labels.signUpCta
            : labels.signInCta}
      </button>
    </form>
  );
};
