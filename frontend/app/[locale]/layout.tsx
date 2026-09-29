import type { Metadata, Viewport } from "next";
import { Anton, Barlow } from "next/font/google";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { CookieNotice } from "@/components/ui/cookie-notice";
import { NOTICE_COOKIE, hasSeenNotice } from "@/lib/cookie-notice";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n/config";
import { THEME_COOKIE, resolveTheme } from "@/lib/theme";
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

// Dichiara che la pagina sa disegnarsi in entrambi i temi: il browser puo'
// cosi' colorare da subito le parti sue (barre, controlli) prima ancora che il
// CSS arrivi. Il tema vero lo decide `data-theme` piu' sotto.
export const viewport: Viewport = { colorScheme: "light dark" };

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

  const dict = getDictionary(locale);

  // La fascia sui cookie si decide qui e non nel browser: senza JavaScript
  // deve funzionare comunque, e un componente client la mostrerebbe per un
  // istante anche a chi l'ha gia' chiusa.
  const cookieStore = await cookies();
  const seenNotice = hasSeenNotice(cookieStore.get(NOTICE_COOKIE)?.value);

  // Il tema si decide qui e non nel browser, per lo stesso motivo della fascia
  // cookie: uno script che lo applica dopo il caricamento mostrerebbe per un
  // istante il tema sbagliato. Per "sistema" non si scrive niente: decide il
  // CSS, con `prefers-color-scheme`.
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html
      lang={locale}
      data-theme={theme === "system" ? undefined : theme}
      className={`${anton.variable} ${barlow.variable}`}
    >
      <body className="bg-neutral-light font-sans text-secondary antialiased">
        {children}
        {seenNotice ? null : (
          <CookieNotice locale={locale} labels={dict.notice} />
        )}
        <Analytics />
      </body>
    </html>
  );
}
