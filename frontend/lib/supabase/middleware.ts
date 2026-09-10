import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Vedi la nota in server.ts: i callback dei cookie vanno annotati a mano.
type CookiesToSet = Parameters<SetAllCookies>[0];

/**
 * Rinfresca la sessione Supabase a ogni richiesta e protegge l'area
 * autenticata.
 *
 * La chiamata a `getUser()` non e' opzionale: e' l'unico punto in cui il token
 * scaduto viene rinnovato e i cookie aggiornati vengono riscritti sulla
 * risposta. Senza di essa il middleware non rinfresca niente e la sessione
 * scade mentre l'utente sta navigando.
 */
export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // `getUser()` valida il token contro Supabase Auth. Non usare `getSession()`
  // per decidere un redirect: legge il cookie senza verificarlo.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login");

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Dopo il login si torna dove si stava andando.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/library";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Va restituita questa response: contiene i cookie di sessione aggiornati.
  return supabaseResponse;
};
