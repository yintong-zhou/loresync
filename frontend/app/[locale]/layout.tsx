import type { Metadata } from "next";
import { Anton, Barlow } from "next/font/google";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n/config";
import "../globals.css";

// I due typeface previsti da brand-guidelines.md. Anton esiste solo in 400;
// Barlow e' caricato in 400 e 700, per un totale di due pesi.
const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
});

// Entrambe le lingue vengono prerenderizzate: il segmento e' dinamico, le
// pagine restano statiche.
export const generateStaticParams = () =>
  LOCALES.map((locale) => ({ locale }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE);

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    // Dichiara ai crawler che le due versioni sono la stessa pagina.
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
  };
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Il proxy prefissa i path con una lingua valida, ma un URL costruito a mano
  // (`/de/...`) arriverebbe fin qui: meglio un 404 che un fallback silenzioso.
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${anton.variable} ${barlow.variable}`}>
      <body className="bg-neutral-light font-sans text-secondary antialiased">
        {children}
      </body>
    </html>
  );
}
