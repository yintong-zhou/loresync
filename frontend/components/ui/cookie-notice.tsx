import Link from "next/link";
import { BUTTON_SM_CLASS } from "@/components/ui/form-styles";
import type { Dictionary } from "@/lib/i18n";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { acknowledgeCookieNotice } from "@/lib/preferences/actions";

/**
 * Fascia informativa sui cookie.
 *
 * Non e' un banner di consenso, ed e' voluto: i cookie di questa applicazione
 * sono tutti tecnici, e per quelli la legge chiede di informare, non di
 * chiedere il permesso. Un pulsante "Rifiuta" qui sarebbe una bugia — non
 * c'e' niente che si possa rifiutare continuando a usare il sito — e un
 * "Accetta" raccoglierebbe un consenso che nessuno ha chiesto.
 *
 * Nessuno stato nel browser: il layout legge il cookie e decide se renderla.
 * La chiusura e' un form POST, come per le altre preferenze, quindi funziona
 * anche senza JavaScript.
 *
 * La action non reindirizza: rivalida, e Next rirenderizza la pagina da cui il
 * form e' partito. Chiusa la fascia si resta dov'era.
 */
export const CookieNotice = ({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Dictionary["notice"];
}) => (
  <aside
    // `role="region"` con nome: e' contenuto persistente in fondo alla
    // pagina, non un avviso che interrompe. `alert` lo farebbe annunciare
    // strappando la parola a quello che si stava leggendo.
    aria-label={labels.privacyLink}
    className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-secondary bg-neutral-light"
  >
    <div className="mx-auto flex max-w-6xl flex-col gap-step-2 px-step-2 py-step-2 md:flex-row md:items-center md:justify-between md:px-step-3">
      <p className="max-w-prose text-sm">
        {labels.text}{" "}
        <Link
          href={localizePath(locale, "/cookie")}
          className="border-b-2 border-secondary font-bold hover:border-primary hover:text-primary"
        >
          {labels.cookieLink}
        </Link>
        {" · "}
        <Link
          href={localizePath(locale, "/privacy")}
          className="border-b-2 border-secondary font-bold hover:border-primary hover:text-primary"
        >
          {labels.privacyLink}
        </Link>
      </p>

      <form action={acknowledgeCookieNotice} className="shrink-0">
        <button type="submit" className={BUTTON_SM_CLASS}>
          {labels.cta}
        </button>
      </form>
    </div>
  </aside>
);
