"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LOCALES,
  localizePath,
  splitLocale,
  type Locale,
} from "@/lib/i18n/config";

/**
 * Selettore di lingua.
 *
 * E' un Client Component solo per `usePathname()`: il cambio lingua deve
 * restare sulla pagina corrente, e un layout lato server non conosce il path.
 * La scelta viene ricordata dal cookie che il proxy scrive quando la pagina
 * localizzata viene visitata, quindi qui non serve scrivere niente.
 */
export const LocaleSwitcher = ({
  current,
  labels,
}: {
  current: Locale;
  labels: Record<Locale, string>;
}) => {
  const pathname = usePathname();
  const { rest } = splitLocale(pathname);

  return (
    <nav className="flex items-baseline gap-step-1">
      {LOCALES.map((locale) =>
        locale === current ? (
          <span
            key={locale}
            aria-current="true"
            className="text-sm font-bold uppercase tracking-wide text-primary"
          >
            {locale}
          </span>
        ) : (
          <Link
            key={locale}
            href={localizePath(locale, rest)}
            hrefLang={locale}
            // Il nome pieno resta accessibile a chi usa uno screen reader,
            // mentre a schermo bastano due lettere.
            aria-label={labels[locale]}
            className="text-sm uppercase tracking-wide text-neutral-dark hover:text-primary"
          >
            {locale}
          </Link>
        ),
      )}
    </nav>
  );
};
