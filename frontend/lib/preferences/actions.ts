"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADULT_COOKIE, isAdultMode } from "@/lib/adult";
import { safeNextPath } from "@/lib/auth/helpers";
import { getLocale } from "@/lib/i18n/server";

/** Un anno: e' una preferenza, non uno stato di sessione. */
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Mostra o nasconde i contenuti per adulti.
 *
 * E' una server action e non un link, per la stessa ragione per cui il logout
 * e' un form POST: un GET puo' essere ripetuto da un prelievo anticipato, e i
 * selettori di questa applicazione puntano sempre allo stato **opposto** a
 * quello attuale. Nascosti i contenuti, il comando punta a "mostra": bastava
 * che il browser o Next prelevassero quel link — cosa che fanno da soli, per
 * rendere istantaneo un eventuale click — perche' la scelta appena espressa
 * venisse riscritta al contrario.
 *
 * Non si poteva rimediare nel proxy: le intestazioni con cui Next annuncia i
 * propri prelievi non arrivano fin li'. L'unica difesa e' che a cambiare una
 * preferenza sia un metodo che nessuno ripete per conto suo.
 *
 * Funziona senza JavaScript quanto il link che sostituisce: e' un form con un
 * pulsante, e il browser lo invia da solo.
 */
export const setAdultMode = async (formData: FormData): Promise<void> => {
  const locale = await getLocale();

  const mode = formData.get("mode");
  const next = formData.get("next");

  // Un valore fuori dai due ammessi non si corregge a caso: si lascia la
  // preferenza com'e' e si torna indietro.
  if (typeof mode === "string" && isAdultMode(mode)) {
    const store = await cookies();
    store.set(ADULT_COOKIE, mode, {
      path: "/",
      maxAge: ONE_YEAR,
      sameSite: "lax",
    });
  }

  // `next` arriva da un campo del form, quindi da chiunque sappia costruirne
  // uno: passa dallo stesso filtro del redirect dopo il login, che accetta
  // solo path interni e scarta gli URL assoluti.
  redirect(safeNextPath(typeof next === "string" ? next : null, locale));
};
