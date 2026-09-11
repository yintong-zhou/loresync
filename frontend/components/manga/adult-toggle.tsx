import {
  BUTTON_ICON_GHOST_SM_CLASS,
  BUTTON_ICON_SM_CLASS,
} from "@/components/ui/form-styles";
import { Icon } from "@/components/ui/icon";
import type { AdultMode } from "@/lib/adult";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { libraryHref, type LibraryParams } from "@/lib/manga/library-url";
import { setAdultMode } from "@/lib/preferences/actions";

/**
 * Mostra o nasconde le serie col tag per adulti.
 *
 * Un form POST e non un link, al contrario del selettore di vista. Il comando
 * punta sempre allo stato **opposto** a quello attuale, e come link veniva
 * prelevato in anticipo dal browser e da Next — che caricano i link per
 * rendere istantaneo un click che forse non arrivera' mai. Quel prelievo
 * passava dal proxy, che lo prendeva per una scelta e riscriveva la
 * preferenza al contrario: la libreria non se ne accorgeva, perche' li' l'URL
 * batte il cookie, ma ogni pagina che si fida del solo cookie si ritrovava il
 * filtro spento.
 *
 * E' la stessa regola gia' scritta accanto al logout: cio' che cambia uno
 * stato non si chiede con un GET. Senza JavaScript funziona come prima — un
 * pulsante di invio e' l'unica cosa che serve.
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
    <form action={setAdultMode}>
      <input type="hidden" name="mode" value={next} />
      {/* Dove tornare dopo il cambio: la stessa libreria, con il filtro nuovo
          gia' nell'URL. Il valore passa dal filtro dei redirect interni prima
          di essere usato, perche' un campo nascosto lo puo' riscrivere
          chiunque. */}
      <input
        type="hidden"
        name="next"
        value={libraryHref(locale, { ...params, adult: next, page: 1 })}
      />
      <button
        type="submit"
        // Il nome dice cosa succede premendo, non com'e' adesso.
        className={hidden ? BUTTON_ICON_SM_CLASS : BUTTON_ICON_GHOST_SM_CLASS}
      >
        {/* Pieno quando il filtro e' attivo, come per la vista scelta: e'
            quello a dire che qualcosa e' nascosto, perche' l'icona da sola
            racconta l'azione. */}
        <Icon name={hidden ? "eye" : "eye-off"} />
        <span className="sr-only">
          {hidden ? labels.adultShow : labels.adultHide}
        </span>
      </button>
    </form>
  );
};
