import { cookies } from "next/headers";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { LegalLinks } from "@/components/ui/legal-links";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { signOut } from "@/lib/auth/actions";
import { getDictionary } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  localizePath,
} from "@/lib/i18n/config";
import { THEME_COOKIE, resolveTheme } from "@/lib/theme";

// Su telefono le tre voci sono schede a larghezza uguale, con l'icona sopra
// l'etichetta e un'altezza da pollice (48px); da `md` tornano una riga di testo
// con l'icona accanto. `gap` stacca l'icona dall'etichetta in entrambi i casi.
// L'allineamento verticale lo decide il contenitore, vedi sotto.
const NAV_CLASS =
  "flex min-h-12 flex-col items-center justify-center gap-step-1 text-xs font-bold uppercase tracking-wide hover:text-primary md:inline-flex md:min-h-0 md:flex-row md:text-sm";

// Layout dell'area autenticata. La sessione e' verificata dal proxy, che
// rimanda a /login prima che questo layout venga renderizzato.
export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const theme = resolveTheme((await cookies()).get(THEME_COOKIE)?.value);

  const languageNames = Object.fromEntries(
    LOCALES.map((l) => [l, getDictionary(l).common.languageName]),
  ) as Record<(typeof LOCALES)[number], string>;

  return (
    <div className="mx-auto max-w-6xl px-step-2 py-step-3 md:px-step-3">
      {/* Su telefono l'intestazione ha due righe: in alto il logo con gli
          strumenti (lingua, esci), sotto le tre voci di navigazione a tutta
          larghezza. Da `md` e' una riga sola, come prima. L'ordine visivo lo
          decide `order`, non il DOM: cosi' lingua e logout esistono una volta
          sola e la lettura da tastiera resta logo, voci, strumenti. Il gap
          orizzontale e' di 8px sotto `md`: con l'unico link lingua a 48px la
          riga in alto misura 329px su 328 a 360px, e con 16px andava a capo per
          un pixel. */}
      <header className="mb-step-3 flex flex-wrap items-center justify-between gap-x-step-1 gap-y-step-1 border-b-2 border-secondary pb-step-2 md:items-baseline md:justify-start md:gap-x-step-2">
        {/* `items-center` sul link, non `items-baseline` come sul contenitore:
            il segno non ha linea di base, e allineato a quella del testo
            risulterebbe sfalsato verso l'alto. */}
        <Link
          href={localizePath(locale, "/dashboard")}
          className="order-1 flex items-center gap-step-1 font-heading text-xl uppercase md:text-2xl"
        >
          <Logo size={32} />
          Loresync
        </Link>

        {/* Le schede sono divise da un filetto e non da un `gap`: cosi' sono
            tre bersagli adiacenti, senza spazi morti dove il tocco non
            arriva. */}
        <nav className="order-3 grid w-full grid-cols-3 divide-x-2 divide-secondary border-2 border-secondary md:order-2 md:ml-auto md:flex md:w-auto md:items-center md:gap-step-3 md:divide-x-0 md:border-0">
          <Link href={localizePath(locale, "/dashboard")} className={NAV_CLASS}>
            <Icon name="chart" />
            {dict.nav.dashboard}
          </Link>
          <Link href={localizePath(locale, "/library")} className={NAV_CLASS}>
            <Icon name="books" />
            {dict.nav.library}
          </Link>
          <Link href={localizePath(locale, "/account")} className={NAV_CLASS}>
            <Icon name="user" />
            {dict.nav.account}
          </Link>
        </nav>

        {/* `items-center` e non `items-baseline`: con un'icona dentro, la
            linea di base allineerebbe il testo lasciando il glifo sfalsato. */}
        <div className="order-2 ml-auto flex items-center gap-step-1 md:order-3 md:ml-step-3 md:gap-step-3">
          <LocaleSwitcher current={locale} labels={languageNames} />

          <ThemeToggle current={theme} labels={dict.common} />

          {/* Il logout cambia stato, quindi e' un form POST e non un link: un
              GET puo' essere seguito da un prefetch o da un antivirus.
              Su telefono e' un riquadro di sola icona, con il nome in
              `sr-only`: da `md` torna il testo sottolineato. */}
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex h-12 w-12 items-center justify-center gap-step-1 border-2 border-secondary text-sm font-bold uppercase tracking-wide hover:border-primary hover:text-primary md:h-auto md:w-auto md:border-0 md:border-b-2"
            >
              <Icon name="exit" />
              <span className="sr-only md:not-sr-only">
                {dict.account.signOut}
              </span>
            </button>
          </form>
        </div>
      </header>
      {children}

      <footer className="mt-step-4 border-t-2 border-secondary pt-step-2">
        <LegalLinks locale={locale} labels={dict.legal} />
      </footer>
    </div>
  );
}
