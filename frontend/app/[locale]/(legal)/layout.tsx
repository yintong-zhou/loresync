import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, localizePath } from "@/lib/i18n/config";

/**
 * Impaginazione delle pagine legali: cookie e privacy.
 *
 * Un gruppo di rotte a se' perche' sono le uniche pagine di testo lungo
 * dell'applicazione, e vogliono una misura di riga stretta che altrove
 * sarebbe sbagliata. Sono anche le uniche pubbliche oltre alla landing e al
 * login: chi deve decidere se registrarsi le legge prima di avere un account,
 * quindi il proxy le lascia passare senza sessione.
 */
export default async function LegalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-6xl px-step-2 py-step-3 md:px-step-3">
      <header className="mb-step-3 border-b-2 border-secondary pb-step-2">
        <Link
          href={localizePath(locale, "/")}
          className="inline-flex items-center gap-step-1 font-heading text-2xl uppercase"
        >
          <Logo size={32} />
          Loresync
        </Link>
      </header>

      {children}

      <footer className="mt-step-4 border-t-2 border-secondary pt-step-2">
        <Link
          href={localizePath(locale, "/")}
          className="text-sm font-bold uppercase tracking-wide text-neutral-dark hover:text-primary"
        >
          {dict.legal.backHome}
        </Link>
      </footer>
    </div>
  );
}
