import Link from "next/link";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, isLocale, localizePath } from "@/lib/i18n/config";
import { READING_STATUSES } from "@/lib/types";

// Landing pubblica di presentazione. Contenuti da PROJECT.md, impaginazione
// secondo brand-guidelines.md: mood Bold, una sola dichiarazione forte per
// schermata, allineamento a sinistra, griglia rotta di proposito, raggio 0.

// Le colonne non sono equidistanti: gli offset sono scritti a mano perche' la
// griglia va rotta di proposito, non per errore.
const STEP_PLACES = [
  "md:col-start-1 md:col-span-3",
  "md:col-start-5 md:col-span-4",
  "md:col-start-10 md:col-span-3",
];

const CTA_CLASS =
  "inline-block bg-primary px-step-3 py-step-2 font-bold uppercase tracking-wide text-neutral-light hover:bg-secondary";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.landing;

  const loginHref = localizePath(locale, "/login");
  const languageNames = Object.fromEntries(
    LOCALES.map((l) => [l, getDictionary(l).common.languageName]),
  ) as Record<(typeof LOCALES)[number], string>;

  return (
    <>
      {/* Clear space minimo: le guideline ammettono il wordmark a filo bordo. */}
      <header className="border-b-2 border-secondary">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-step-2 px-step-2 py-step-2 md:px-step-3">
          <span className="font-heading text-2xl uppercase">Loresync</span>
          <div className="flex items-baseline gap-step-3">
            <LocaleSwitcher current={locale} labels={languageNames} />
            <Link
              href={loginHref}
              className="border-b-2 border-secondary text-sm font-bold uppercase tracking-wide hover:border-primary hover:text-primary"
            >
              {dict.common.login}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* La dichiarazione forte della schermata. Il titolo esce dal margine
            destro e il contenitore lo taglia: bleed previsto dalle guideline. */}
        <section className="overflow-hidden border-b-2 border-secondary">
          <div className="mx-auto max-w-6xl px-step-2 py-step-4 md:px-step-3 md:py-step-5">
            {/* leading-none e non l'interlinea globale 0.9: a corpo display
                l'accento di PI&Ugrave; sfonderebbe nella riga sopra. */}
            <h1 className="-mr-step-3 font-heading text-[clamp(3.25rem,13vw,11rem)] uppercase leading-none md:-mr-step-5">
              {t.hero.line1}
              <br />
              <span className="text-primary">{t.hero.line2}</span>
            </h1>

            {/* Il testo di servizio parte a met&agrave; griglia, non sotto il titolo. */}
            <div className="mt-step-3 grid grid-cols-12 gap-step-2 md:mt-step-4">
              <p className="col-span-12 max-w-prose text-lg md:col-span-6 md:col-start-6 md:text-xl">
                {t.hero.lead}
              </p>
              <div className="col-span-12 md:col-span-6 md:col-start-6">
                <Link href={loginHref} className={CTA_CLASS}>
                  {t.hero.cta}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Numeri a scala esagerata contro testo piccolo: contrasto di scala. */}
        <section className="border-b-2 border-secondary">
          <div className="mx-auto max-w-6xl px-step-2 py-step-4 md:px-step-3 md:py-step-5">
            <h2 className="text-4xl uppercase md:text-6xl">{t.steps.title}</h2>
            <ol className="mt-step-3 grid grid-cols-12 gap-step-3 md:mt-step-4">
              {t.steps.items.map((step, i) => (
                <li
                  key={step.title}
                  className={`col-span-12 ${STEP_PLACES[i] ?? ""}`}
                >
                  <span
                    aria-hidden
                    className="block font-heading text-7xl leading-none text-primary md:text-8xl"
                  >
                    {`0${i + 1}`}
                  </span>
                  <h3 className="mt-step-2 text-2xl uppercase md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-step-1 max-w-prose text-neutral-dark">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Wordmark sovradimensionato e tagliato dal bordo: tipografia come
            elemento grafico dominante. */}
        <div
          aria-hidden
          className="overflow-hidden border-b-2 border-secondary bg-secondary"
        >
          <span className="-ml-[3vw] block whitespace-nowrap font-heading text-[clamp(5rem,26vw,20rem)] uppercase leading-[0.8] text-neutral-light">
            Loresync Loresync
          </span>
        </div>

        <section className="border-b-2 border-secondary">
          <div className="mx-auto grid max-w-6xl grid-cols-12 gap-step-3 px-step-2 py-step-4 md:px-step-3 md:py-step-5">
            <h2 className="col-span-12 text-4xl uppercase md:col-span-4 md:text-5xl">
              {t.features.title}
            </h2>
            <ul className="col-span-12 md:col-span-7 md:col-start-6">
              {t.features.items.map((feature) => (
                <li
                  key={feature}
                  className="border-t-2 border-secondary py-step-2 text-lg md:text-xl"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b-2 border-secondary">
          <div className="mx-auto max-w-6xl px-step-2 py-step-4 md:px-step-3 md:py-step-5">
            <h2 className="text-4xl uppercase md:text-5xl">
              {t.statuses.title}
            </h2>
            <ul className="mt-step-3 flex flex-wrap gap-step-2">
              {READING_STATUSES.map((status, i) => (
                <li
                  key={status}
                  // Un solo blocco in giallo: l'accento resta un accento.
                  className={`border-2 border-secondary px-step-2 py-step-1 font-bold uppercase tracking-wide ${
                    i === 0 ? "bg-accent" : ""
                  }`}
                >
                  {dict.readingStatus[status]}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Fondo nero a tutta larghezza: i limiti di PROJECT.md dichiarati
            senza giri di parole, come da tono di voce. */}
        <section className="bg-secondary text-neutral-light">
          <div className="mx-auto grid max-w-6xl grid-cols-12 gap-step-3 px-step-2 py-step-4 md:px-step-3 md:py-step-5">
            <h2 className="col-span-12 text-4xl uppercase md:col-span-5 md:text-6xl">
              {t.limits.line1}
              <br />
              {t.limits.line2}
            </h2>
            <div className="col-span-12 md:col-span-6 md:col-start-7">
              <ul>
                {t.limits.items.map((limit) => (
                  <li
                    key={limit}
                    className="border-t-2 border-neutral-light py-step-2 text-lg md:text-xl"
                  >
                    {limit}
                  </li>
                ))}
              </ul>
              <p className="mt-step-3 max-w-prose text-lg">{t.limits.note}</p>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-secondary">
          <div className="mx-auto grid max-w-6xl grid-cols-12 gap-step-2 px-step-2 py-step-4 md:px-step-3 md:py-step-5">
            <h2 className="col-span-12 text-4xl uppercase md:col-span-8 md:text-6xl">
              {t.final.title}
            </h2>
            <div className="col-span-12 md:col-span-4 md:col-start-9">
              <Link href={loginHref} className={CTA_CLASS}>
                {dict.common.login}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-step-2 py-step-3 md:px-step-3">
        <p className="text-sm uppercase tracking-wide text-neutral-dark">
          {t.footer}
        </p>
      </footer>
    </>
  );
}
