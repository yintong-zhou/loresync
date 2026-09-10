import Link from "next/link";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { getDictionary } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  localizePath,
} from "@/lib/i18n/config";

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
  const languageNames = Object.fromEntries(
    LOCALES.map((l) => [l, getDictionary(l).common.languageName]),
  ) as Record<(typeof LOCALES)[number], string>;

  return (
    <div className="mx-auto max-w-6xl px-step-2 py-step-3 md:px-step-3">
      <header className="mb-step-3 flex items-baseline justify-between gap-step-2 border-b-2 border-secondary pb-step-2">
        <Link href={localizePath(locale, "/library")} className="font-heading text-2xl uppercase">
          Loresync
        </Link>
        <LocaleSwitcher current={locale} labels={languageNames} />
        {/* TODO: navigazione + logout */}
      </header>
      {children}
    </div>
  );
}
