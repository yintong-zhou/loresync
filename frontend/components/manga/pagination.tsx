import Link from "next/link";
import { BUTTON_GHOST_SM_CLASS, CHIP_SM_CLASS } from "@/components/ui/form-styles";
import { Icon } from "@/components/ui/icon";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { libraryHref, type LibraryParams } from "@/lib/manga/library-url";

/**
 * Precedente / successiva, piu' la posizione nell'elenco.
 *
 * Due link e non un elenco numerato: le pagine crescono con la libreria, e una
 * fila di numeri che si allunga senza fine costringerebbe a nasconderne una
 * parte dietro dei puntini. Chi cerca una serie precisa usa la ricerca, che e'
 * li' sopra e arriva prima.
 *
 * I link portano con se' filtri, ordinamento e vista: cambiare pagina non deve
 * cambiare nient'altro di quello che si sta guardando.
 */
export const Pagination = ({
  page,
  pageCount,
  locale,
  params,
  labels,
}: {
  page: number;
  pageCount: number;
  locale: Locale;
  params: LibraryParams;
  labels: Dictionary["library"];
}) => {
  if (pageCount <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < pageCount;

  return (
    <nav
      aria-label={labels.paginationLabel}
      className="flex items-center justify-between gap-step-1 border-t-2 border-secondary pt-step-2"
    >
      {/* Agli estremi il pulsante sparisce invece di restare spento: un link
          disabilitato non esiste in HTML, e un `<a>` senza `href` riceve
          comunque il fuoco da tastiera senza portare da nessuna parte. */}
      {hasPrev ? (
        <Link
          href={libraryHref(locale, { ...params, page: page - 1 })}
          rel="prev"
          className={BUTTON_GHOST_SM_CLASS}
        >
          <Icon name="prev" />
          {labels.prevPage}
        </Link>
      ) : (
        <span />
      )}

      {/* Stessa forma del contatore sopra l'elenco: numero, barra, totale. */}
      <p className={CHIP_SM_CLASS}>
        {labels.page} {page} / {pageCount}
      </p>

      {hasNext ? (
        <Link
          href={libraryHref(locale, { ...params, page: page + 1 })}
          rel="next"
          className={BUTTON_GHOST_SM_CLASS}
        >
          {labels.nextPage}
          <Icon name="next" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
};
