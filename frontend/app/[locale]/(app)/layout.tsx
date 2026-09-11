import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { Logo } from "@/components/ui/logo";
import { signOut } from "@/lib/auth/actions";
import { getDictionary } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  localizePath,
} from "@/lib/i18n/config";

// `inline-flex` e `gap`: l'icona sta in fila con l'etichetta e si stacca da
// sola. L'allineamento verticale lo decide il contenitore, vedi sotto.
const NAV_CLASS =
  "inline-flex items-center gap-step-1 text-sm font-bold uppercase tracking-wide hover:text-primary";

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

  const languageNames = Object.fromEntries(
    LOCALES.map((l) => [l, getDictionary(l).common.languageName]),
  ) as Record<(typeof LOCALES)[number], string>;

  return (
    <div className="mx-auto max-w-6xl px-step-2 py-step-3 md:px-step-3">
      <header className="mb-step-3 flex flex-wrap items-baseline justify-between gap-step-2 border-b-2 border-secondary pb-step-2">
        {/* `items-center` sul link, non `items-baseline` come sul contenitore:
            il segno non ha linea di base, e allineato a quella del testo
            risulterebbe sfalsato verso l'alto. */}
        <Link
          href={localizePath(locale, "/library")}
          className="flex items-center gap-step-1 font-heading text-2xl uppercase"
        >
          <Logo size={32} />
          Loresync
        </Link>

        {/* `items-center` e non `items-baseline`: con un'icona dentro, la
            linea di base allineerebbe il testo lasciando il glifo sfalsato. */}
        <nav className="flex flex-wrap items-center gap-step-3">
          <Link href={localizePath(locale, "/library")} className={NAV_CLASS}>
            <Icon name="books" />
            {dict.nav.library}
          </Link>
          <Link href={localizePath(locale, "/account")} className={NAV_CLASS}>
            <Icon name="user" />
            {dict.nav.account}
          </Link>

          <LocaleSwitcher current={locale} labels={languageNames} />

          {/* Il logout cambia stato, quindi e' un form POST e non un link: un
              GET puo' essere seguito da un prefetch o da un antivirus. */}
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-step-1 border-b-2 border-secondary text-sm font-bold uppercase tracking-wide hover:border-primary hover:text-primary"
            >
              <Icon name="exit" />
              {dict.account.signOut}
            </button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
