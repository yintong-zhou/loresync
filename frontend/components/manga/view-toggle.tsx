import Link from "next/link";
import {
  BUTTON_ICON_GHOST_SM_CLASS,
  BUTTON_ICON_SM_CLASS,
} from "@/components/ui/form-styles";
import { Icon, type IconName } from "@/components/ui/icon";
import type { Dictionary } from "@/lib/i18n";
import { localizePath, type Locale } from "@/lib/i18n/config";
import { VIEW_MODES, type ViewMode } from "@/lib/view-mode";

/**
 * Selettore elenco / griglia.
 *
 * Due link e non un form: la scelta finisce nell'URL come i filtri, quindi si
 * puo' condividere e funziona senza JavaScript. A trasformarla in preferenza
 * duratura ci pensa il proxy, che vede `?view=` e scrive il cookie.
 */
export const ViewToggle = ({
  current,
  locale,
  filters,
  labels,
}: {
  current: ViewMode;
  locale: Locale;
  /** Filtri attivi, da riportare nel link: cambiare vista non li azzera. */
  filters: { q?: string; status?: string; tag?: string };
  labels: Dictionary["library"];
}) => {
  const hrefFor = (view: ViewMode) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    if (filters.tag) params.set("tag", filters.tag);
    params.set("view", view);
    return `${localizePath(locale, "/library")}?${params.toString()}`;
  };

  const text: Record<ViewMode, string> = {
    list: labels.viewList,
    grid: labels.viewGrid,
  };

  // Il glifo dice gia' tutto: righe impilate contro riquadri affiancati. Il
  // nome resta comunque scritto, come testo `sr-only`, invece che in un
  // `aria-label`: cosi' viaggia con i dizionari come ogni altra stringa.
  const icon: Record<ViewMode, IconName> = { list: "list", grid: "grid" };

  return (
    <nav aria-label={labels.viewLabel} className="flex gap-step-1">
      {VIEW_MODES.map((view) => {
        const active = view === current;
        return (
          <Link
            key={view}
            href={hrefFor(view)}
            // Il colore da solo non basta a dire quale vista e' attiva: chi
            // usa uno screen reader lo sa da qui.
            aria-current={active ? "page" : undefined}
            className={
              active ? BUTTON_ICON_SM_CLASS : BUTTON_ICON_GHOST_SM_CLASS
            }
          >
            <Icon name={icon[view]} />
            <span className="sr-only">{text[view]}</span>
          </Link>
        );
      })}
    </nav>
  );
};
