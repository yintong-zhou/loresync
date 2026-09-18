import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, localizePath } from "@/lib/i18n/config";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE);
  return { title: dict.legal.privacy.title };
};

const HEADING_CLASS = "text-2xl uppercase md:text-3xl";
const BODY_CLASS = "mt-step-2 max-w-prose";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.legal.privacy;

  return (
    <main className="flex flex-col gap-step-3">
      <h1 className="text-4xl uppercase md:text-6xl">{t.title}</h1>

      <section>
        <h2 className={HEADING_CLASS}>{t.whatHeading}</h2>
        <p className={BODY_CLASS}>{t.whatAccount}</p>
        <p className={BODY_CLASS}>{t.whatLibrary}</p>
      </section>

      <section>
        <h2 className={HEADING_CLASS}>{t.whyHeading}</h2>
        <p className={BODY_CLASS}>{t.why}</p>
      </section>

      <section>
        <h2 className={HEADING_CLASS}>{t.whoHeading}</h2>
        <p className={BODY_CLASS}>{t.whoSupabase}</p>
        <p className={BODY_CLASS}>{t.whoResend}</p>
      </section>

      <section>
        <h2 className={HEADING_CLASS}>{t.notHeading}</h2>
        <p className={BODY_CLASS}>{t.not}</p>
      </section>

      <section>
        <h2 className={HEADING_CLASS}>{t.rightsHeading}</h2>
        <p className={BODY_CLASS}>{t.rightsIntro}</p>
        <p className={BODY_CLASS}>{t.rightsInProduct}</p>
      </section>

      <p>
        <Link
          href={localizePath(locale, "/cookie")}
          className="border-b-2 border-secondary text-sm font-bold uppercase tracking-wide hover:border-primary hover:text-primary"
        >
          {dict.legal.cookie.title}
        </Link>
      </p>
    </main>
  );
}
