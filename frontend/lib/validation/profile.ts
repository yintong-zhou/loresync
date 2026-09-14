import { z } from "zod";
import { LOCALES } from "@/lib/i18n/config";
import { passwordSchema } from "./auth";

/** Stessi limiti del vincolo `profiles_display_name_length` su Postgres. */
export const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(60),
  preferredLocale: z.enum(LOCALES),
});

export const newEmailSchema = z.object({
  email: z.string().trim().email(),
});

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  // Il confronto sta qui e non nel componente: una validazione che vive solo
  // nel browser non e' una validazione.
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "mismatch",
  });

export type ProfileInput = z.infer<typeof profileSchema>;

/**
 * Conferma della chiusura account.
 *
 * Volutamente `min(1)` e non `passwordSchema`: qui la password non si sta
 * scegliendo, si sta dimostrando di conoscerla. Applicare il minimo di otto
 * caratteri farebbe rispondere "dati non validi" a chi ne digita una corta e
 * sbagliata, dicendogli qualcosa sulla password vera; il verdetto lo da'
 * Supabase, e per l'utente e' sempre lo stesso.
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(1),
});
