"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localizePath,
} from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema, signUpSchema } from "@/lib/validation/auth";
import {
  formError,
  formSuccess,
  type FormState,
} from "@/lib/form-state";
import { authErrorMessage, safeNextPath } from "./helpers";
import { cookies } from "next/headers";

/** La lingua arriva dal form: va validata come qualunque altro input. */
const readLocale = (formData: FormData) => {
  const raw = String(formData.get("locale") ?? "");
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
};

export const signIn = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const locale = readLocale(formData);
  const dict = getDictionary(locale);

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return formError(dict.auth.errors.invalidInput);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return formError(authErrorMessage(error, dict));

  const destination = safeNextPath(
    formData.get("next") ? String(formData.get("next")) : null,
    locale,
  );

  // `redirect()` lancia: va chiamata fuori dal try/catch di eventuali wrapper,
  // altrimenti l'eccezione di controllo verrebbe scambiata per un errore.
  revalidatePath("/", "layout");
  redirect(destination);
};

export const signUp = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const locale = readLocale(formData);
  const dict = getDictionary(locale);

  const rawDisplayName = String(formData.get("displayName") ?? "").trim();

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: rawDisplayName === "" ? undefined : rawDisplayName,
    preferredLocale: locale,
  });

  if (!parsed.success) return formError(dict.auth.errors.invalidInput);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Letti dal trigger `handle_new_user` per popolare `profiles`.
      data: {
        display_name: parsed.data.displayName ?? null,
        preferred_locale: parsed.data.preferredLocale,
      },
    },
  });

  if (error) return formError(authErrorMessage(error, dict));

  // Il progetto Supabase ha "Confirm email" disattivato: `signUp` apre subito
  // la sessione e si entra diritti nella libreria.
  //
  // Il ramo qui sotto resta come rete: se un domani la conferma venisse
  // riattivata dalla dashboard, senza di esso l'utente verrebbe mandato in
  // libreria senza sessione e rimbalzato al login senza capire perche'.
  if (!data.session) return formSuccess(dict.auth.checkEmail);

  revalidatePath("/", "layout");
  redirect(localizePath(locale, "/library"));
};

export const signOut = async (formData: FormData): Promise<void> => {
  const locale = readLocale(formData);

  const supabase = await createClient();
  await supabase.auth.signOut();

  // La lingua non e' un dato di sessione: resta dopo il logout.
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, { path: "/", sameSite: "lax" });

  revalidatePath("/", "layout");
  redirect(localizePath(locale, "/login"));
};
