import { redirect } from "next/navigation";
import { AccountForm } from "@/components/account/account-form";
import {
  FIELD_CLASS,
  HINT_CLASS,
  LABEL_CLASS,
} from "@/components/ui/form-styles";
import { getDictionary } from "@/lib/i18n";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  localizePath,
} from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { updateEmail, updatePassword, updateProfile } from "./actions";

const SECTION_CLASS =
  "grid grid-cols-12 gap-step-3 border-t-2 border-secondary py-step-3";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = dict.account;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Il proxy protegge gia' la rotta; questo e' il controllo che conta, perche'
  // sta accanto alla lettura dei dati e non puo' essere aggirato cambiando
  // matcher.
  if (!user) redirect(localizePath(locale, "/login"));

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, preferred_locale")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="flex flex-col">
      <h1 className="text-4xl uppercase md:text-6xl">{t.title}</h1>

      <section className={SECTION_CLASS}>
        <h2 className="col-span-12 text-2xl uppercase md:col-span-4 md:text-3xl">
          {t.profileSection}
        </h2>
        <div className="col-span-12 md:col-span-7 md:col-start-6">
          <AccountForm
            action={updateProfile}
            locale={locale}
            submitLabel={t.save}
            pendingLabel={t.pending}
          >
            <div>
              <label className={LABEL_CLASS} htmlFor="displayName">
                {dict.auth.displayNameLabel}
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                minLength={2}
                maxLength={60}
                defaultValue={profile?.display_name ?? ""}
                className={`mt-step-1 ${FIELD_CLASS}`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="preferredLocale">
                {t.preferredLocaleLabel}
              </label>
              <select
                id="preferredLocale"
                name="preferredLocale"
                defaultValue={profile?.preferred_locale ?? locale}
                className={`mt-step-1 ${FIELD_CLASS}`}
              >
                {LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {getDictionary(l).common.languageName}
                  </option>
                ))}
              </select>
              <p className={HINT_CLASS}>{t.preferredLocaleHint}</p>
            </div>
          </AccountForm>
        </div>
      </section>

      <section className={SECTION_CLASS}>
        <h2 className="col-span-12 text-2xl uppercase md:col-span-4 md:text-3xl">
          {t.emailSection}
        </h2>
        <div className="col-span-12 md:col-span-7 md:col-start-6">
          <p className="mb-step-2">
            <span className={LABEL_CLASS}>{t.currentEmail}</span>
            <span className="text-lg">{user.email}</span>
          </p>
          <AccountForm
            action={updateEmail}
            locale={locale}
            submitLabel={t.save}
            pendingLabel={t.pending}
          >
            <div>
              <label className={LABEL_CLASS} htmlFor="email">
                {t.newEmailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={`mt-step-1 ${FIELD_CLASS}`}
              />
              <p className={HINT_CLASS}>{t.emailChangeHint}</p>
            </div>
          </AccountForm>
        </div>
      </section>

      <section className={SECTION_CLASS}>
        <h2 className="col-span-12 text-2xl uppercase md:col-span-4 md:text-3xl">
          {t.passwordSection}
        </h2>
        <div className="col-span-12 md:col-span-7 md:col-start-6">
          <AccountForm
            action={updatePassword}
            locale={locale}
            submitLabel={t.save}
            pendingLabel={t.pending}
          >
            <div>
              <label className={LABEL_CLASS} htmlFor="password">
                {t.newPasswordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                className={`mt-step-1 ${FIELD_CLASS}`}
              />
              <p className={HINT_CLASS}>{dict.auth.passwordHint}</p>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="confirmPassword">
                {t.confirmPasswordLabel}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                className={`mt-step-1 ${FIELD_CLASS}`}
              />
            </div>
          </AccountForm>
        </div>
      </section>
    </main>
  );
}
