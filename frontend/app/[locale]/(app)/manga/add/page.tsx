import { MangaForm } from "@/components/manga/manga-form";
import { createEntry } from "@/lib/manga/actions";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

export default async function AddMangaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <main className="flex flex-col gap-step-3">
      <h1 className="text-4xl uppercase md:text-6xl">{dict.manga.addTitle}</h1>

      <div className="grid grid-cols-12">
        <div className="col-span-12 md:col-span-8">
          <MangaForm
            action={createEntry}
            labels={dict.manga}
            statusLabels={dict.readingStatus}
          />
        </div>
      </div>
    </main>
  );
}
