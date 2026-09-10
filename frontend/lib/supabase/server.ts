import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";

// L'opzione `cookies` di createServerClient e' un'unione di due interfacce
// (API nuova e deprecata): il contextual typing non attraversa le unioni, quindi
// i parametri dei callback vanno annotati a mano.
type CookiesToSet = Parameters<SetAllCookies>[0];

/**
 * Client Supabase per Server Component, route handler e server action.
 * Propaga la sessione dell'utente tramite i cookie della richiesta, cosi'
 * `auth.uid()` e' valorizzato e le policy RLS filtrano per utente.
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Chiamato da un Server Component, dove i cookie sono in sola
            // lettura. Si puo' ignorare: il refresh della sessione lo fa il
            // proxy (proxy.ts).
          }
        },
      },
    },
  );
};
