import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/ui/logo";
import { signIn, signUp } from "@/lib/auth/actions";
import { getDictionary } from "@/lib/i18n";
import { DEFAULT_LOCALE, isLocale, localizePath } from "@/lib/i18n/config";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; mode?: string; error?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const { next, mode, error } = await searchParams;
  const isSignUp = mode === "signup";

  // Il link fra accesso e registrazione conserva il `next`: chi arriva da una
  // pagina protetta e scopre di non avere un account ci torna dopo essersi
  // registrato, invece di finire in libreria.
  const otherModeHref = {
    pathname: localizePath(locale, "/login"),
    query: {
      ...(isSignUp ? {} : { mode: "signup" }),
      ...(next ? { next } : {}),
    },
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-step-3 px-step-2 py-step-4 md:px-step-3">
      <div className="grid grid-cols-12 gap-step-3">
        <div className="col-span-12 md:col-span-5">
          <Link
            href={localizePath(locale, "/")}
            // `inline-flex`: il link non e' figlio di un contenitore flex come
            // nelle altre intestazioni, e a tutta larghezza l'area cliccabile
            // arriverebbe fino al bordo della colonna.
            className="inline-flex items-center gap-step-1 font-heading text-2xl uppercase"
          >
            <Logo size={32} />
            Loresync
          </Link>
          <h1 className="mt-step-2 text-4xl uppercase md:text-6xl">
            {isSignUp ? dict.auth.signUpTitle : dict.auth.loginTitle}
          </h1>
        </div>

        <div className="col-span-12 md:col-span-6 md:col-start-7">
          {/* Arriva da /auth/callback quando il link e' scaduto o gia' usato. */}
          {error === "link" ? (
            <p
              role="alert"
              className="mb-step-2 border-2 border-primary px-step-2 py-step-1 text-primary"
            >
              {dict.auth.errors.invalidLink}
            </p>
          ) : null}

          <LoginForm
            action={isSignUp ? signUp : signIn}
            mode={isSignUp ? "signup" : "signin"}
            next={next ?? null}
            labels={dict.auth}
          />

          <p className="mt-step-2">
            <Link
              href={otherModeHref}
              className="border-b-2 border-secondary text-sm font-bold uppercase tracking-wide hover:border-primary hover:text-primary"
            >
              {isSignUp ? dict.auth.toSignIn : dict.auth.toSignUp}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
