import { cookies } from "next/headers";
import Link from "next/link";
import { GridCard } from "@/components/manga/grid-card";
import { MangaCard } from "@/components/manga/manga-card";
import { ViewToggle } from "@/components/manga/view-toggle";
import {
  BUTTON_CLASS,
  BUTTON_GHOST_SM_CLASS,
  BUTTON_SM_CLASS,
  FIELD_SM_CLASS,
  LABEL_CLASS,
} from "@/components/ui/form-styles";
import { Icon } from "@/components/ui/icon";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, localizePath } from "@/lib/i18n/config";
import { getLibrary } from "@/lib/manga/queries";
import { READING_STATUSES } from "@/lib/types";
import { readingStatusSchema } from "@/lib/validation/manga";
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
    view?: string;
  }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.library;

  const { q, status, tag, view } = await searchParams;
  const parsedStatus = readingStatusSchema.safeParse(status);

  // L'URL batte il cookie: un link condiviso si apre come l'ha lasciato chi
  // l'ha mandato. Il cookie lo scrive il proxy vedendo passare `?view=`.
  const viewMode = resolveViewMode(
    view,
    (await cookies()).get(VIEW_COOKIE)?.value,
  );

  const { entries, allTags, totalCount } = await getLibrary({
    search: q?.trim() || undefined,
    status: parsedStatus.success ? parsedStatus.data : null,
    tag: tag?.trim() || null,
  });

  const hasFilters = Boolean(q?.trim() || parsedStatus.success || tag?.trim());

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
          mettere fra i preferiti e funziona anche senza JavaScript. */}
      <form
        method="get"
        action={localizePath(locale, "/library")}
        className="grid grid-cols-12 items-end gap-step-1 border-t-2 border-secondary pt-step-2"
      >
        {/* La vista viaggia con i filtri: senza, filtrare da griglia
            riporterebbe all'elenco. */}
        <input type="hidden" name="view" value={viewMode} />

        <div className="col-span-12 md:col-span-5">
          <label className={LABEL_CLASS} htmlFor="q">
            {t.searchLabel}
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder={t.searchPlaceholder}
            className={`mt-step-1 w-full ${FIELD_SM_CLASS}`}
          />
        </div>

        <div className="col-span-6 md:col-span-3">
          <label className={LABEL_CLASS} htmlFor="status">
            {dict.manga.statusLabel}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={parsedStatus.success ? parsedStatus.data : ""}
            className={`mt-step-1 w-full ${FIELD_SM_CLASS}`}
          >
            <option value="">{t.anyStatus}</option>
            {READING_STATUSES.map((value) => (
              <option key={value} value={value}>
                {dict.readingStatus[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-6 md:col-span-2">
          <label className={LABEL_CLASS} htmlFor="tag">
            {dict.manga.tagsLabel}
          </label>
          <select
            id="tag"
            name="tag"
            defaultValue={tag ?? ""}
            className={`mt-step-1 w-full ${FIELD_SM_CLASS}`}
          >
            <option value="">{t.anyTag}</option>
            {allTags.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 flex gap-step-1 md:col-span-2">
          <button
            type="submit"
            className={BUTTON_SM_CLASS}
          >
            <Icon name="search" />
            {t.filter}
          </button>
          {hasFilters ? (
            <Link
              // Azzera i filtri, non la vista.
              href={`${localizePath(locale, "/library")}?view=${viewMode}`}
              className={BUTTON_GHOST_SM_CLASS}
            >
              <Icon name="close" />
              {t.clear}
            </Link>
          ) : null}
        </div>
      </form>

      {entries.length === 0 ? (
        // Libreria vuota e filtro senza esiti sono due situazioni diverse:
        // nella prima si invita ad aggiungere, nella seconda a togliere filtri.
        <p className="max-w-prose border-t-2 border-secondary py-step-2 text-lg">
          {totalCount === 0 ? t.empty : t.noResults}
        </p>
      ) : (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-step-1 pb-step-1">
            <p className="text-sm uppercase tracking-wide text-neutral-dark">
              {entries.length} / {totalCount}
            </p>
            <ViewToggle
              current={viewMode}
              locale={locale}
              filters={{ q, status, tag }}
              labels={t}
            />
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
            entries.map((entry) => (
              <MangaCard
                key={entry.id}
                entry={entry}
                locale={locale}
                labels={dict.manga}
                statusLabels={dict.readingStatus}
              />
            ))
          )}
        </section>
      )}
    </main>
  );
}
