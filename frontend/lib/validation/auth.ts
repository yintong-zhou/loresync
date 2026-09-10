import { z } from "zod";
import { LOCALES } from "@/lib/i18n/config";

/**
 * Password: minimo 8 caratteri, massimo 72.
 * Il tetto non e' arbitrario: bcrypt tronca oltre i 72 byte, quindi una
 * password piu' lunga darebbe una falsa sensazione di robustezza.
 */
export const passwordSchema = z.string().min(8).max(72);

export const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: passwordSchema,
});

export const signUpSchema = credentialsSchema.extend({
  // Facoltativo alla registrazione: si puo' sempre impostare dall'account.
  displayName: z.string().trim().min(2).max(60).optional(),
  preferredLocale: z.enum(LOCALES),
});

export type Credentials = z.infer<typeof credentialsSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
