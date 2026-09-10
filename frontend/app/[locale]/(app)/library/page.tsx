import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

// TODO: caricare le entry da Supabase (RLS per utente) e collegare filtri e
// ricerca per tag.
export default async function LibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE);

  return (
    <main className="flex flex-col gap-step-2">
      <h1 className="text-4xl uppercase md:text-5xl">{dict.library.title}</h1>
      <p className="max-w-prose text-neutral-dark">
        {dict.library.placeholder}
      </p>
    </main>
  );
}
