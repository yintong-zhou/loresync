import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeNextPath } from "@/lib/auth/helpers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localizePath,
} from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Punto di atterraggio dei link inviati per email: conferma della
 * registrazione, cambio indirizzo, recupero password.
 *
 * Sta fuori da `/[locale]` perche' l'URL finisce dentro alle email e dentro
 * alla configurazione del progetto Supabase: deve restare stabile anche se un
 * giorno cambiassero le lingue gestite. Il proxy lo lascia passare senza
 * prefisso.
 *
 * Perche' i template delle email vadano qui, in Supabase vanno impostati su
 * `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type={{ .Type }}`:
 * il template di default usa un flusso pensato per app che girano solo nel
 * browser, e con la sessione lato server non lascerebbe nessun cookie.
 */
export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = cookieLocale && isLocale(cookieLocale)
    ? cookieLocale
    : DEFAULT_LOCALE;

  const destination = safeNextPath(searchParams.get("next"), locale);
  const supabase = await createClient();

  // Flusso PKCE (cambio email, OAuth): arriva un codice da scambiare.
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(destination, request.url));
  }

  // Flusso a token: conferma registrazione e recupero password.
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(new URL(destination, request.url));
  }

  // Link scaduto, gia' usato o manomesso: si torna al login con un avviso,
  // senza dire quale delle tre cose sia successa.
  const failure = new URL(localizePath(locale, "/login"), request.url);
  failure.searchParams.set("error", "link");
  return NextResponse.redirect(failure);
};
