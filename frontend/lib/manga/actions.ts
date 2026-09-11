"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formError, formSuccess, type FormState } from "@/lib/form-state";
import { getDictionary } from "@/lib/i18n";
import { localizePath } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeUrl } from "@/lib/url";
import {
  mangaEditSchema,
  mangaFormSchema,
  readingStatusSchema,
} from "@/lib/validation/manga";

/** Postgres: violazione di vincolo di unicita'. */
const UNIQUE_VIOLATION = "23505";

export const createEntry = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const parsed = mangaFormSchema.safeParse({
    seriesUrl: formData.get("seriesUrl"),
    chapterUrl: formData.get("chapterUrl"),
    title: formData.get("title"),
    coverUrl: formData.get("coverUrl"),
    description: formData.get("description"),
    currentChapter: formData.get("currentChapter"),
    status: formData.get("status"),
    tags: formData.get("tags") ?? "",
  });

  if (!parsed.success) return formError(dict.manga.errors.invalidInput);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return formError(dict.account.errors.notSignedIn);

  // Stessa normalizzazione usata dall'estrattore: senza, lo stesso link con un
  // `utm_source` diverso entrerebbe come una seconda serie.
  const series = normalizeUrl(parsed.data.seriesUrl);
  if (!series) return formError(dict.manga.errors.invalidInput);
  const chapter = parsed.data.chapterUrl
    ? normalizeUrl(parsed.data.chapterUrl)
    : null;

  const { error } = await supabase.from("manga_entries").insert({
    user_id: user.id,
    series_url: series.toString(),
    chapter_url: chapter?.toString() ?? null,
    title: parsed.data.title,
    cover_url: parsed.data.coverUrl ?? null,
    description: parsed.data.description ?? null,
    current_chapter: parsed.data.currentChapter,
    status: parsed.data.status,
    tags: parsed.data.tags,
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return formError(dict.manga.errors.duplicate);
    }
    return formError(dict.manga.errors.generic);
  }

  revalidatePath(localizePath(locale, "/library"));
  redirect(localizePath(locale, "/library"));
};

/**
 * Aggiorna capitolo e stato dalla libreria, senza aprire il form intero.
 *
 * Sono due campi ma una sola azione: nell'uso reale si aggiornano insieme
 * ("sono al 39, e l'ho messo in pausa"), e due form affiancati significavano
 * due pulsanti Salva a un centimetro di distanza.
 *
 * Ogni campo e' facoltativo: si aggiorna solo cio' che arriva leggibile,
 * cosi' un capitolo scritto male non azzera anche lo stato.
 */
export const updateProgress = async (formData: FormData): Promise<void> => {
  const locale = await getLocale();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const patch: { current_chapter?: number; status?: string } = {};

  const rawChapter = String(formData.get("currentChapter") ?? "")
    .trim()
    .replace(",", ".");
  if (rawChapter) {
    const value = Number.parseFloat(rawChapter);
    if (Number.isFinite(value) && value >= 0) patch.current_chapter = value;
  }

  const status = readingStatusSchema.safeParse(formData.get("status"));
  if (status.success) patch.status = status.data;

  if (Object.keys(patch).length === 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("manga_entries")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath(localizePath(locale, "/library"));
};

/**
 * Modifica i campi che si correggono a mano: titolo, link della serie, tag e
 * descrizione.
 *
 * A differenza di `updateProgress` questa torna uno `FormState`: cambiare il
 * link puo' scontrarsi con una serie gia' in libreria, e un fallimento
 * silenzioso lascerebbe credere di aver salvato.
 */
export const updateDetails = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const id = String(formData.get("id") ?? "");

  if (!id) return formError(dict.manga.errors.generic);

  const parsed = mangaEditSchema.safeParse({
    seriesUrl: formData.get("seriesUrl"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    tags: formData.get("tags") ?? "",
  });

  if (!parsed.success) return formError(dict.manga.errors.invalidInput);

  // Stessa normalizzazione dell'inserimento: senza, lo stesso link con un
  // parametro di tracciamento in piu' sfuggirebbe al vincolo di unicita'.
  const series = normalizeUrl(parsed.data.seriesUrl);
  if (!series) return formError(dict.manga.errors.invalidInput);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return formError(dict.account.errors.notSignedIn);

  // Ogni campo del pannello arriva con il valore salvato gia' dentro, quindi
  // quello che torna e' la versione completa: si scrive cosi' com'e'. Un campo
  // svuotato a mano e' una cancellazione voluta, non un campo non compilato.
  const patch = {
    series_url: series.toString(),
    title: parsed.data.title,
    tags: parsed.data.tags,
    description: parsed.data.description || null,
  };

  const { error } = await supabase
    .from("manga_entries")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return formError(dict.manga.errors.duplicate);
    }
    return formError(dict.manga.errors.generic);
  }

  revalidatePath(localizePath(locale, "/library"));
  return formSuccess(dict.manga.saved);
};

export const deleteEntry = async (formData: FormData): Promise<void> => {
  const locale = await getLocale();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("manga_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath(localizePath(locale, "/library"));
};
