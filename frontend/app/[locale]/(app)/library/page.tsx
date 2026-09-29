import { cookies } from "next/headers";
import Link from "next/link";
import { GridCard } from "@/components/manga/grid-card";
import { MangaCard } from "@/components/manga/manga-card";
import { AdultToggle } from "@/components/manga/adult-toggle";
import { Pagination } from "@/components/manga/pagination";
import { ViewToggle } from "@/components/manga/view-toggle";
import {
  BUTTON_CLASS,
  BUTTON_FILTER_CLASS,
  BUTTON_GHOST_FILTER_CLASS,
  FIELD_FILTER_CLASS,
  LABEL_CLASS,
  OPTION_CLASS,
  SELECT_FILTER_CLASS,
} from "@/components/ui/form-styles";
import { Icon } from "@/components/ui/icon";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, localizePath } from "@/lib/i18n/config";
import { libraryHref } from "@/lib/manga/library-url";
import { getLibrary } from "@/lib/manga/queries";
import { SORT_KEYS, resolveSort, type SortKey } from "@/lib/manga/sort";
import { READING_STATUSES } from "@/lib/types";
import { readingStatusSchema } from "@/lib/validation/manga";
import { ADULT_COOKIE, resolveAdultMode } from "@/lib/adult";
import { VIEW_COOKIE, resolveViewMode } from "@/lib/view-mode";

export default async function LibraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
    tag?: string;
    sort?: string;
    view?: string;
    adult?: string;
    page?: string;
  }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.library;

  const { q, status, tag, sort, view, adult, page } = await searchParams;
  const parsedStatus = readingStatusSchema.safeParse(status);
  const sortKey = resolveSort(sort);
  // Una pagina illeggibile vale quanto nessuna pagina: si parte dalla prima.
  // Il tetto lo mette `getLibrary`, l'unico a sapere quante ce ne sono.
  const requestedPage = Number.parseInt(page ?? "", 10);

  // L'URL batte il cookie: un link condiviso si apre come l'ha lasciato chi
  // l'ha mandato. I cookie li scrive il proxy, vedendo passare `?view=` e
  // `?adult=`.
  const cookieStore = await cookies();
  const viewMode = resolveViewMode(view, cookieStore.get(VIEW_COOKIE)?.value);
  const adultMode = resolveAdultMode(
    adult,
    cookieStore.get(ADULT_COOKIE)?.value,
  );

  const {
    entries,
    allTags,
    totalCount,
    filteredCount,
    page: currentPage,
    pageCount,
  } = await getLibrary({
    search: q?.trim() || undefined,
    status: parsedStatus.success ? parsedStatus.data : null,
    tag: tag?.trim() || null,
    sort: sortKey,
    hideAdult: adultMode === "hide",
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
  });

  const hasFilters = Boolean(q?.trim() || parsedStatus.success || tag?.trim());

  // I filtri che su telefono stanno nel pannello: la ricerca no, perche' ha il
  // suo campo sempre in vista. Il pannello si apre da solo se ce n'e' uno
  // attivo, cosi' chi torna su una ricerca condivisa vede cosa la restringe.
  const panelFilterCount =
    (parsedStatus.success ? 1 : 0) + (tag?.trim() ? 1 : 0);

  const sortLabels: Record<SortKey, string> = {
    recent: t.sortNewest,
    oldest: t.sortOldest,
    az: t.sortAz,
    za: t.sortZa,
  };

  /** Stato della pagina, da riportare nei link che non devono cambiarlo. */
  const linkParams = {
    q,
    status: parsedStatus.success ? parsedStatus.data : undefined,
    tag,
    sort: sortKey,
    view: viewMode,
    adult: adultMode,
    page: currentPage,
  };

  // Azzera i filtri, non la vista, l'ordinamento o la scelta sui contenuti per
  // adulti: quella e' una preferenza, non un filtro di ricerca, e non si
  // azzera con gli altri. Compare in due punti — accanto a "Filtra" da `md`, in
  // fila col pannello su telefono — quindi il `className` lo decide chi lo
  // mette, e il resto sta qui una volta sola.
  const clearLink = (className: string) => (
    <Link
      href={libraryHref(locale, {
        sort: sortKey,
        view: viewMode,
        adult: adultMode,
      })}
      className={`${BUTTON_GHOST_FILTER_CLASS} ${className}`}
    >
      <Icon name="close" />
      {t.clear}
    </Link>
  );

  return (
    <main className="flex flex-col gap-step-2">
      <div className="flex flex-wrap items-baseline justify-between gap-step-2">
        <h1 className="text-4xl uppercase md:text-6xl">{t.title}</h1>
        <Link
          href={localizePath(locale, "/manga/add")}
          className={BUTTON_CLASS}
        >
          <Icon name="plus" />
          {dict.nav.add}
        </Link>
      </div>

      {/* Filtri come form GET: finiscono nell'URL, quindi una ricerca si puo'
          mettere fra i preferiti e funziona anche senza JavaScript.
          La pagina non e' fra i campi: cambiando filtri o ordinamento l'elenco
          e' un altro, e restare alla settima pagina di quello di prima non
          vorrebbe dire niente. */}
      <form
        method="get"
        action={localizePath(locale, "/library")}
        className="grid grid-cols-12 items-end gap-step-1 border-t-2 border-secondary pt-step-2"
      >
        {/* La vista viaggia con i filtri: senza, filtrare da griglia
            riporterebbe all'elenco. */}
        <input type="hidden" name="view" value={viewMode} />

        {/* Stessa ragione: filtrare non deve rimettere in pagina i contenuti
            che hai appena nascosto. */}
        <input type="hidden" name="adult" value={adultMode} />

        {/* Interruttore del pannello dei filtri su telefono. E' una casella
            senza `name`, quindi non viaggia nell'URL, e il pannello lo
            comanda il CSS (`peer-checked`) e non JavaScript: i filtri sono un
            form GET che deve funzionare anche senza. Sta prima del pannello
            perche' `peer` vede solo i fratelli che lo seguono. Da `md` non
            serve piu': il pannello e' sempre aperto. */}
        <input
          id="filters-toggle"
          type="checkbox"
          defaultChecked={panelFilterCount > 0}
          className="peer sr-only"
        />

        {/* Le larghezze seguono quanto serve alle etichette piu' lunghe, non
            una spartizione in parti uguali, e cambiano due volte invece di una
            sola: su schermo largo (`lg`) i cinque controlli stanno in fila,
            mentre nella fascia intermedia i dodicesimi non bastano — le voci
            venivano tagliate a meta' parola — e la riga si spezza, con la
            ricerca sopra e le tre tendine sotto.
            Sotto `md` la barra e' un'altra: la ricerca da sola in cima con il
            suo pulsante, una riga con "Filtri" e "Azzera", e le tendine nel
            pannello che si apre. Cosi' la lista dei risultati compare nel
            primo schermo invece che sotto quattro righe di controlli. */}
        <div className="col-span-12 lg:col-span-3">
          {/* Su telefono il segnaposto basta a dire cosa fa il campo. */}
          <label
            className={`${LABEL_CLASS} sr-only md:not-sr-only`}
            htmlFor="q"
          >
            {t.searchLabel}
          </label>
          <div className="flex gap-step-1 md:mt-step-1 md:block">
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q ?? ""}
              placeholder={t.searchPlaceholder}
              className={`min-w-0 flex-1 md:w-full ${FIELD_FILTER_CLASS}`}
            />
            {/* Il pulsante di invio accanto al campo, solo su telefono; da `md`
                ce n'e' uno in fondo alla barra, vedi sotto. Nascosto con
                `display: none` non e' raggiungibile da tastiera, quindi non
                ci sono due tappe per lo stesso comando. */}
            <button
              type="submit"
              className={`${BUTTON_FILTER_CLASS} w-12 px-0 md:hidden`}
            >
              <Icon name="search" />
              <span className="sr-only">{t.filter}</span>
            </button>
          </div>
        </div>

        {/* Il colore pieno a pannello aperto dice che i filtri sono in vista,
            come gli altri interruttori della pagina. Il numero dice quanti ne
            hai attivi anche a pannello chiuso. */}
        <label
          htmlFor="filters-toggle"
          className={`${BUTTON_GHOST_FILTER_CLASS} cursor-pointer peer-checked:border-secondary peer-checked:bg-secondary peer-checked:text-neutral-light peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary md:hidden ${
            hasFilters ? "col-span-6" : "col-span-12"
          }`}
        >
          {t.filters}
          {panelFilterCount > 0 ? ` (${panelFilterCount})` : null}
        </label>
        {hasFilters ? clearLink("col-span-6 md:hidden") : null}

        {/* Il pannello e' nascosto su telefono finche' la casella non e'
            spuntata. Da `md` diventa `contents`: sparisce come scatola e le
            tre tendine tornano figlie dirette della griglia dodici colonne,
            cioe' la barra di prima, senza duplicare i campi. */}
        <div className="col-span-12 hidden grid-cols-12 gap-step-1 peer-checked:grid md:contents">
          <div className="col-span-6 md:col-span-4 lg:col-span-2">
            <label className={LABEL_CLASS} htmlFor="status">
              {dict.manga.statusLabel}
            </label>
            <select
              id="status"
              name="status"
              defaultValue={parsedStatus.success ? parsedStatus.data : ""}
              className={`mt-step-1 w-full ${SELECT_FILTER_CLASS}`}
            >
              <option className={OPTION_CLASS} value="">
                {t.anyStatus}
              </option>
              {READING_STATUSES.map((value) => (
                <option className={OPTION_CLASS} key={value} value={value}>
                  {dict.readingStatus[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-6 md:col-span-4 lg:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tag">
              {dict.manga.tagsLabel}
            </label>
            <select
              id="tag"
              name="tag"
              defaultValue={tag ?? ""}
              className={`mt-step-1 w-full ${SELECT_FILTER_CLASS}`}
            >
              <option className={OPTION_CLASS} value="">
                {t.anyTag}
              </option>
              {allTags.map((value) => (
                <option className={OPTION_CLASS} key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* L'ordinamento sta dentro il form dei filtri e non a parte: si
              applica con lo stesso pulsante, cosi' cambiare ordine e filtro
              insieme costa un viaggio solo. */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <label className={LABEL_CLASS} htmlFor="sort">
              {t.sortLabel}
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sortKey}
              className={`mt-step-1 w-full ${SELECT_FILTER_CLASS}`}
            >
              {SORT_KEYS.map((value) => (
                <option className={OPTION_CLASS} key={value} value={value}>
                  {sortLabels[value]}
                </option>
              ))}
            </select>
          </div>

          {/* Su telefono, con il pannello aperto, i filtri nuovi si applicano
              da qui: il pulsante accanto alla ricerca e' lontano dalle
              tendine appena cambiate. */}
          <button
            type="submit"
            className={`${BUTTON_FILTER_CLASS} col-span-12 md:hidden`}
          >
            <Icon name="search" />
            {t.filter}
          </button>
        </div>

        <div className="col-span-12 hidden gap-step-1 md:flex lg:col-span-2">
          <button type="submit" className={BUTTON_FILTER_CLASS}>
            <Icon name="search" />
            {t.filter}
          </button>
          {hasFilters ? clearLink("") : null}
        </div>
      </form>

      {entries.length === 0 ? (
        // Libreria vuota e filtro senza esiti sono due situazioni diverse:
        // nella prima si invita ad aggiungere, nella seconda a togliere filtri.
        <p className="max-w-prose border-t-2 border-secondary py-step-2 text-lg">
          {totalCount === 0 ? t.empty : t.noResults}
        </p>
      ) : (
        <section className="flex flex-col gap-step-2">
          <div className="flex flex-wrap items-center justify-between gap-step-1 pb-step-1">
            {/* Quante ne trovano i filtri sul totale della libreria, non
                quante ne mostri questa pagina: e' il numero che dice se il
                filtro ha stretto troppo. */}
            <p className="text-sm uppercase tracking-wide text-neutral-dark">
              {filteredCount} / {totalCount}
            </p>
            {/* I due comandi che cambiano cosa vedi, in fila: prima cosa
                compare, poi come. */}
            <div className="flex gap-step-1">
              <AdultToggle
                current={adultMode}
                locale={locale}
                params={linkParams}
                labels={t}
              />
              <ViewToggle
                current={viewMode}
                locale={locale}
                params={linkParams}
                labels={t}
              />
            </div>
          </div>

          {viewMode === "grid" ? (
            // Le colonne crescono con lo schermo: due su telefono, cinque su
            // un monitor largo. La misura la decide la griglia, non la
            // copertina, che si adatta alla colonna.
            <ul className="grid grid-cols-2 gap-step-2 border-t-2 border-secondary pt-step-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {entries.map((entry) => (
                <GridCard
                  key={entry.id}
                  entry={entry}
                  labels={dict.manga}
                  statusLabels={dict.readingStatus}
                />
              ))}
            </ul>
          ) : (
            <div>
              {entries.map((entry) => (
                <MangaCard
                  key={entry.id}
                  entry={entry}
                  labels={dict.manga}
                  statusLabels={dict.readingStatus}
                />
              ))}
            </div>
          )}

          <Pagination
            page={currentPage}
            pageCount={pageCount}
            locale={locale}
            params={linkParams}
            labels={t}
          />
        </section>
      )}
    </main>
  );
}
