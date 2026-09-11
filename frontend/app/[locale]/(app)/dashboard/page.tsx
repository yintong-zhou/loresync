import Link from "next/link";
import { Stat } from "@/components/dashboard/stat";
import { BUTTON_CLASS } from "@/components/ui/form-styles";
import { Icon } from "@/components/ui/icon";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, localizePath } from "@/lib/i18n/config";
import { libraryHref } from "@/lib/manga/library-url";
import { getDashboard, RECENT_DAYS } from "@/lib/manga/stats";
import { READING_STATUSES } from "@/lib/types";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.dashboard;

  // Niente scelta sui contenuti per adulti da leggere: questa pagina non
  // mostra nessuna serie, solo conteggi, e i conteggi comprendono tutto.
  const { totalCount, byStatus, chaptersRead, recent } = await getDashboard();

  // Separatori delle migliaia secondo la lingua della pagina: 1.284 in
  // italiano, 1,284 in inglese.
  const number = new Intl.NumberFormat(locale);

  // Libreria vuota: un invito solo, senza una griglia di zeri. Gli zeri
  // sarebbero veri ma non direbbero niente, e occuperebbero lo schermo al
  // posto dell'unica cosa da fare.
  if (totalCount === 0) {
    return (
      <main className="flex flex-col gap-step-3">
        <h1 className="text-4xl uppercase md:text-6xl">{t.title}</h1>
        <p className="max-w-prose border-t-2 border-secondary pt-step-2 text-lg">
          {t.empty}
        </p>
        <div>
          <Link
            href={localizePath(locale, "/manga/add")}
            className={BUTTON_CLASS}
          >
            <Icon name="plus" />
            {dict.nav.add}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-step-3">
      <h1 className="text-4xl uppercase md:text-6xl">{t.title}</h1>

      <section className="flex flex-col gap-step-2">
        <h2 className="text-sm font-bold uppercase tracking-wide">
          {t.statsSection}
        </h2>

        {/* Due colonne su telefono, tutte in fila da `md` in su: le cifre sono
            corte e a una per riga lascerebbero mezzo schermo vuoto. */}
        <div className="grid grid-cols-2 gap-step-2 md:grid-cols-4">
          <Stat value={number.format(chaptersRead)} label={t.chaptersRead} />
          <Stat value={number.format(totalCount)} label={t.series} />
          {RECENT_DAYS.map((days) => (
            <Stat
              key={days}
              value={number.format(recent[days] ?? 0)}
              label={t.recent.replace("{days}", String(days))}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-step-2">
        <h2 className="text-sm font-bold uppercase tracking-wide">
          {t.statusSection}
        </h2>

        {/* Ogni stato porta alla libreria gia' filtrata: il numero diventa la
            domanda, e il click la risposta. Senza il link sarebbe una cifra
            che obbliga a rifare il filtro a mano.

            Nessun parametro `adult` nel link: la libreria ha la sua
            preferenza, e questi conteggi comprendono comunque tutto. Con il
            filtro attivo la libreria ne mostrera' meno di quante ne diceva il
            riquadro — sono i numeri a dire tutto, e lo schermo a mostrare solo
            quel che si vuole vedere. */}
        <ul className="flex flex-wrap gap-step-1">
          {READING_STATUSES.map((status) => (
            <li key={status}>
              <Link
                href={libraryHref(locale, { status })}
                className="flex min-w-[112px] flex-col border-2 border-secondary p-step-1 hover:border-primary hover:text-primary"
              >
                <span className="font-heading text-3xl leading-none tabular-nums">
                  {number.format(byStatus[status])}
                </span>
                <span className="text-sm font-bold uppercase tracking-wide">
                  {dict.readingStatus[status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
