import Link from "next/link";
import {
  BUTTON_ICON_GHOST_SM_CLASS,
  BUTTON_ICON_SM_CLASS,
} from "@/components/ui/form-styles";
import { Icon } from "@/components/ui/icon";
import type { AdultMode } from "@/lib/adult";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { libraryHref, type LibraryParams } from "@/lib/manga/library-url";

/**
 * Mostra o nasconde le serie col tag per adulti.
 *
 * Un link e non un interruttore, come il selettore di vista: la scelta finisce
 * nell'URL, il proxy la trasforma in cookie, e tutto funziona senza
 * JavaScript. Per la stessa ragione non e' un `button` con `aria-pressed`: qui
 * si sta navigando verso una libreria filtrata, non premendo un tasto che
 * resta giu'.
 *
 * Torna sempre alla prima pagina: cambiando il filtro l'elenco e' un altro, e
 * restare alla quarta pagina di quello di prima non vorrebbe dire niente.
 */
export const AdultToggle = ({
  current,
  locale,
  params,
  labels,
}: {
  current: AdultMode;
  locale: Locale;
  params: LibraryParams;
  labels: Dictionary["library"];
}) => {
  const hidden = current === "hide";
  const next: AdultMode = hidden ? "show" : "hide";

  return (
    <Link
      href={libraryHref(locale, { ...params, adult: next, page: 1 })}
      // Il nome dice cosa succede premendo, non com'e' adesso: e' un link, e
      // di un link ci si aspetta di sapere dove porta.
      className={hidden ? BUTTON_ICON_SM_CLASS : BUTTON_ICON_GHOST_SM_CLASS}
    >
      {/* Pieno quando il filtro e' attivo, come per la vista scelta: e' quello
          a dire che qualcosa e' nascosto, perche' l'icona da sola racconta
          l'azione. */}
      <Icon name={hidden ? "eye" : "eye-off"} />
      <span className="sr-only">
        {hidden ? labels.adultShow : labels.adultHide}
      </span>
    </Link>
  );
};
