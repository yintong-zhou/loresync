import Link from "next/link";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { signOut } from "@/lib/auth/actions";
import { getDictionary } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  localizePath,
} from "@/lib/i18n/config";

const NAV_CLASS =
  "text-sm font-bold uppercase tracking-wide hover:text-primary";

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
        <Link
          href={localizePath(locale, "/library")}
          className="font-heading text-2xl uppercase"
        >
          Loresync
        </Link>

        <nav className="flex flex-wrap items-baseline gap-step-3">
          <Link href={localizePath(locale, "/library")} className={NAV_CLASS}>
            {dict.nav.library}
          </Link>
          <Link href={localizePath(locale, "/manga/add")} className={NAV_CLASS}>
            {dict.nav.add}
          </Link>
          <Link href={localizePath(locale, "/account")} className={NAV_CLASS}>
            {dict.nav.account}
          </Link>

          <LocaleSwitcher current={locale} labels={languageNames} />

          {/* Il logout cambia stato, quindi e' un form POST e non un link: un
              GET puo' essere seguito da un prefetch o da un antivirus. */}
          <form action={signOut}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="border-b-2 border-secondary text-sm font-bold uppercase tracking-wide hover:border-primary hover:text-primary"
            >
              {dict.account.signOut}
            </button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
