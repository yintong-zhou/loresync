import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

// TODO: form di login/registrazione via Supabase Auth (email + password).
export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-step-2 px-step-2 md:px-step-3">
      <h1 className="text-4xl uppercase md:text-6xl">{dict.auth.loginTitle}</h1>
      <p className="max-w-prose text-neutral-dark">
        {dict.auth.loginPlaceholder}
      </p>
    </main>
  );
}
