import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  isLocale,
  localizePath,
  looksLikeLocale,
  negotiateLocale,
  splitLocale,
} from "@/lib/i18n/config";
import { ADULT_COOKIE, isAdultMode } from "@/lib/adult";
import { VIEW_COOKIE, isViewMode } from "@/lib/view-mode";

// Vedi la nota in server.ts: i callback dei cookie vanno annotati a mano.
type CookiesToSet = Parameters<SetAllCookies>[0];

/**
 * Rinfresca la sessione Supabase a ogni richiesta, decide la lingua e protegge
 * l'area autenticata.
 *
 * La chiamata a `getUser()` non e' opzionale: e' l'unico punto in cui il token
 * scaduto viene rinnovato e i cookie aggiornati vengono riscritti sulla
 * risposta. Senza di essa il proxy non rinfresca niente e la sessione scade
 * mentre l'utente sta navigando.
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

  // Le route handler non sono localizzate e non vanno redirette: un client che
  // chiama l'API si aspetta uno status, non un 307 verso una pagina. Il
  // controllo di autorizzazione lo fa ogni handler.
  if (pathname.startsWith("/api")) {
    return supabaseResponse;
  }

  // `/auth/callback` e' l'URL scritto nelle email e nella configurazione del
  // progetto Supabase: non va prefissato con la lingua, o i link gia' spediti
  // smetterebbero di funzionare.
  if (pathname.startsWith("/auth")) {
    return supabaseResponse;
  }

  const { locale, rest } = splitLocale(pathname);

  // Nessun prefisso di lingua: si sceglie e si redirige una volta sola.
  // Ordine di precedenza: scelta esplicita (cookie) prima della negoziazione
  // col browser, altrimenti la preferenza dell'utente verrebbe sovrascritta a
  // ogni visita.
  if (!locale) {
    // Lingua non gestita: lasciala passare e diventa 404, invece di produrre
    // un path assurdo come `/it/de/library`.
    if (looksLikeLocale(pathname.split("/")[1] ?? "")) {
      return supabaseResponse;
    }

    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    const target =
      saved && isLocale(saved)
        ? saved
        : negotiateLocale(request.headers.get("accept-language"));

    const url = request.nextUrl.clone();
    url.pathname = localizePath(target, pathname);
    return NextResponse.redirect(url);
  }

  // Le regole di autenticazione ragionano sul path senza lingua: `/login` e
  // `/en/login` sono la stessa rotta logica.
  const isAuthRoute = rest.startsWith("/login");
  // La landing di presentazione deve restare raggiungibile da chi non ha un
  // account: e' il suo unico scopo. Ogni altra rotta pubblica va aggiunta qui.
  const isPublicRoute = rest === "/" || isAuthRoute;

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = localizePath(locale, "/login");
    // Dopo il login si torna dove si stava andando, lingua compresa.
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    // Dopo il login si atterra in dashboard e non in libreria: e' la pagina
    // che risponde alla domanda con cui si apre l'app — dov'ero arrivato —
    // mentre la libreria serve a cercare, e cercare viene dopo.
    url.pathname = localizePath(locale, "/dashboard");
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Da qui in giu' si registrano le preferenze lette dall'URL. Il presupposto
  // e' che chiedere un indirizzo equivalga a sceglierlo — vero quando a
  // chiederlo e' l'utente, falso quando a chiederlo e' il browser.
  //
  // Next preleva in anticipo i link che entrano nello schermo, e i selettori di
  // questa applicazione sono link che puntano allo stato **opposto** a quello
  // attuale: nascosti i contenuti per adulti, il pulsante punta a
  // `?adult=show`, il prelievo passa di qui e la preferenza appena espressa
  // viene riscritta al contrario. Nella libreria non si vedeva, perche' li'
  // l'URL batte il cookie; si vedeva altrove, dove il cookie e' l'unica fonte.
  //
  // Un prelievo anticipato non e' una scelta: si riconosce dalle intestazioni
  // che Next gli mette addosso, e non lascia scritto niente.
  // Copre il prelievo avviato dal browser, che si annuncia. **Non** copre
  // quello avviato da Next: le sue intestazioni (`RSC`, `Next-Router-Prefetch`)
  // vengono tolte prima che il proxy giri — verificato, qui arrivano solo
  // `purpose` e `sec-purpose`. Finche' i selettori restano link GET la scelta
  // resta quindi sovrascrivibile: la difesa vera e' non cambiare una
  // preferenza con un GET.
  const isPrefetch =
    request.headers.get("purpose") === "prefetch" ||
    (request.headers.get("sec-purpose") ?? "").startsWith("prefetch");

  if (isPrefetch) return supabaseResponse;

  // Visitare una pagina localizzata equivale a scegliere quella lingua: cosi'
  // il selettore non ha bisogno di scrivere cookie lato client.
  supabaseResponse.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // Stessa idea per la vista della libreria: il selettore e' fatto di link, e
  // chiedere `?view=grid` equivale a sceglierla. Il cookie va scritto qui
  // perche' durante il render di una pagina non e' permesso, e passare per una
  // server action avrebbe voluto dire un form al posto di due link.
  const view = request.nextUrl.searchParams.get("view");
  if (view && isViewMode(view)) {
    supabaseResponse.cookies.set(VIEW_COOKIE, view, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  // E per lo stesso motivo la scelta sui contenuti per adulti: e' un link
  // anche quella, e chi la nasconde deve ritrovarla nascosta al rientro.
  const adult = request.nextUrl.searchParams.get("adult");
  if (adult && isAdultMode(adult)) {
    supabaseResponse.cookies.set(ADULT_COOKIE, adult, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  // Va restituita questa response: contiene i cookie di sessione aggiornati.
  return supabaseResponse;
};
