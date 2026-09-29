"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LOCALES,
  localizePath,
  splitLocale,
  type Locale,
} from "@/lib/i18n/config";

// Su telefono ogni codice e' un riquadro da 48px: due lettere a corpo `sm`
// sono un bersaglio troppo piccolo per il pollice. Da `md` torna il testo nudo.
const TARGET =
  "inline-flex h-12 min-w-10 items-center justify-center text-sm uppercase tracking-wide md:h-auto md:min-w-0";

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
    <nav className="flex items-center gap-step-1 md:items-baseline">
      {LOCALES.map((locale) =>
        locale === current ? (
          <span
            key={locale}
            aria-current="true"
            className={`${TARGET} font-bold text-primary`}
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
            className={`${TARGET} text-neutral-dark hover:text-primary`}
          >
            {locale}
          </Link>
        ),
      )}
    </nav>
  );
};
