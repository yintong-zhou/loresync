import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return { title: dict.legal.cookie.title };
};

const CELL_CLASS = "border-2 border-secondary px-step-2 py-step-1 text-left";

export default async function CookiePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = getDictionary(locale).legal.cookie;

  // Nominate una per una e non in un array: cosi' una riga dimenticata in
  // `en.ts` non compila, invece di sparire dalla tabella a pagina aperta.
  const rows = [
    t.rows.session,
    t.rows.locale,
    t.rows.view,
    t.rows.adult,
    t.rows.notice,
  ];

  return (
    <main className="flex flex-col gap-step-3">
      <h1 className="text-4xl uppercase md:text-6xl">{t.title}</h1>

      <p className="max-w-prose text-lg">{t.intro}</p>

      {/* La tabella scorre da sola sugli schermi stretti: i nomi dei cookie
          non vanno a capo, e senza questo sarebbe la pagina intera a
          scorrere in orizzontale. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr className="uppercase tracking-wide">
              <th className={CELL_CLASS} scope="col">
                {t.tableName}
              </th>
              <th className={CELL_CLASS} scope="col">
                {t.tablePurpose}
              </th>
              <th className={CELL_CLASS} scope="col">
                {t.tableDuration}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <th className={`${CELL_CLASS} font-mono font-normal`} scope="row">
                  {row.name}
                </th>
                <td className={CELL_CLASS}>{row.purpose}</td>
                <td className={CELL_CLASS}>{row.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="max-w-prose">{t.noProfiling}</p>

      <section>
        <h2 className="text-2xl uppercase md:text-3xl">{t.manageHeading}</h2>
        <p className="mt-step-2 max-w-prose">{t.manage}</p>
      </section>
    </main>
  );
}
