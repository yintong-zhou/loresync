"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authErrorMessage } from "@/lib/auth/helpers";
import {
  formError,
  formSuccess,
  type FormState,
} from "@/lib/form-state";
import { getDictionary } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localizePath,
} from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import {
  newEmailSchema,
  newPasswordSchema,
  profileSchema,
} from "@/lib/validation/profile";

/** URL assoluto per i link inviati via email. */
const callbackUrl = () =>
  `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`;

export const updateProfile = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    preferredLocale: formData.get("preferredLocale"),
  });

  if (!parsed.success) return formError(dict.account.errors.invalidInput);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return formError(dict.account.errors.notSignedIn);

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      preferred_locale: parsed.data.preferredLocale,
    })
    // La RLS filtra gia' per utente, ma la condizione resta esplicita: se un
    // giorno la policy cambiasse, questa update non diventerebbe di massa.
    .eq("id", user.id);

  if (error) return formError(dict.account.errors.generic);

  // La lingua preferita e' anche quella dell'interfaccia: allinea il cookie,
  // altrimenti l'utente salva "English" e continua a vedere l'italiano.
  const next = parsed.data.preferredLocale;
  if (next !== locale) {
    const cookieStore = await cookies();
    cookieStore.set(LOCALE_COOKIE, next, { path: "/", sameSite: "lax" });
    revalidatePath("/", "layout");
    redirect(localizePath(next, "/account"));
  }

  revalidatePath("/", "layout");
  return formSuccess(dict.account.saved);
};

export const updateEmail = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const parsed = newEmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return formError(dict.account.errors.invalidInput);

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser(
    { email: parsed.data.email },
    { emailRedirectTo: callbackUrl() },
  );

  if (error) return formError(authErrorMessage(error, dict));

  // Il cambio non e' immediato: Supabase manda un link al nuovo indirizzo (e,
  // se configurato, uno anche al vecchio) e applica il cambio alla conferma.
  return formSuccess(dict.account.emailChangeRequested);
};

export const updatePassword = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const mismatch = parsed.error.issues.some(
      (issue) => issue.message === "mismatch",
    );
    return formError(
      mismatch ? dict.account.passwordMismatch : dict.account.errors.weakPassword,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return formError(authErrorMessage(error, dict));

  return formSuccess(dict.account.passwordChanged);
};
