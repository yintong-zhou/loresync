import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { localizePath, type Locale } from "@/lib/i18n/config";

const LINK_CLASS =
  "text-sm font-bold uppercase tracking-wide text-neutral-dark hover:text-primary";

/**
 * Link a cookie e privacy, condivisi dal footer della landing e da quello
 * dell'area autenticata.
 *
 * Servono in entrambi i posti e non solo nella landing: senza, chi ha fatto
 * l'accesso non ha piu' modo di arrivare alle informative, e un'informativa
 * che non si raggiunge non informa. La fascia sui cookie non basta a
 * sostituirli, perche' sparisce dopo la prima chiusura.
 */
export const LegalLinks = ({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Dictionary["legal"];
}) => (
  <nav className="mt-step-2 flex flex-wrap gap-step-3">
    <Link href={localizePath(locale, "/cookie")} className={LINK_CLASS}>
      {labels.cookie.title}
    </Link>
    <Link href={localizePath(locale, "/privacy")} className={LINK_CLASS}>
      {labels.privacy.title}
    </Link>
  </nav>
);
