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
