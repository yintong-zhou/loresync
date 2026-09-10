import Link from "next/link";
import { MangaCard } from "@/components/manga/manga-card";
import {
  BUTTON_CLASS,
  BUTTON_GHOST_SM_CLASS,
  BUTTON_SM_CLASS,
  FIELD_SM_CLASS,
  LABEL_CLASS,
} from "@/components/ui/form-styles";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, localizePath } from "@/lib/i18n/config";
import { getLibrary } from "@/lib/manga/queries";
import { READING_STATUSES } from "@/lib/types";
import { readingStatusSchema } from "@/lib/validation/manga";

export default async function LibraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string; tag?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.library;

  const { q, status, tag } = await searchParams;
  const parsedStatus = readingStatusSchema.safeParse(status);

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
            {t.filter}
          </button>
          {hasFilters ? (
            <Link
              href={localizePath(locale, "/library")}
              className={BUTTON_GHOST_SM_CLASS}
            >
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
          <p className="pb-step-1 text-sm uppercase tracking-wide text-neutral-dark">
            {entries.length} / {totalCount}
          </p>
          {entries.map((entry) => (
            <MangaCard
              key={entry.id}
              entry={entry}
              locale={locale}
              labels={dict.manga}
              statusLabels={dict.readingStatus}
            />
          ))}
        </section>
      )}
    </main>
  );
}
