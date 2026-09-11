import { z } from "zod";

/** Stati di lettura ammessi (allineati all'enum su Supabase). */
export const readingStatusSchema = z.enum([
  "in_corso",
  "completato",
  "in_pausa",
  "droppato",
]);

/** Tetto ai tag di una serie, condiviso da inserimento e modifica. */
const MAX_TAGS = 20;

/** Payload del form di inserimento / aggiornamento di una serie. */
export const mangaEntryInputSchema = z.object({
  seriesUrl: z.string().url(),
  chapterUrl: z.string().url().nullable().optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).nullable().optional(),
  currentChapter: z.number().nonnegative().nullable().optional(),
  status: readingStatusSchema.default("in_corso"),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
});

export type MangaEntryInput = z.infer<typeof mangaEntryInputSchema>;

/**
 * I tag arrivano dal form come stringa unica separata da virgole.
 * Normalizzati qui: minuscoli, senza spazi ai bordi, senza duplicati e senza
 * vuoti, cosi' "Azione, azione ,  " non diventa tre tag diversi.
 */
export const parseTags = (raw: string): string[] => {
  const seen = new Set<string>();

  for (const piece of raw.split(",")) {
    const tag = piece.trim().toLowerCase().slice(0, 50);
    if (tag) seen.add(tag);
  }

  return [...seen].slice(0, MAX_TAGS);
};

/**
 * Modifica di una serie gia' in libreria: i campi che si correggono a mano.
 * Capitolo e stato hanno gia' i loro controlli in linea, e la copertina arriva
 * dal sito, non dall'utente.
 *
 * Ogni campo arriva con il valore salvato e viene riscritto per intero, quindi
 * qui non serve distinguere "non toccato" da "svuotato": cio' che arriva e'
 * cio' che l'utente ha davanti agli occhi. La descrizione vuota vuol dire
 * cancellata, e per questo resta una stringa e non diventa `undefined`.
 *
 * Il titolo fa eccezione: e' obbligatorio come all'inserimento, quindi vuoto
 * non vuol dire cancellato ma sbagliato, e il salvataggio si ferma. Stessi
 * limiti del form di inserimento, altrimenti un titolo accettato li' potrebbe
 * essere rifiutato correggendo una virgola.
 */
export const mangaEditSchema = z.object({
  seriesUrl: z.string().trim().url(),
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(2000),
  tags: z.string().transform(parseTags),
});

/**
 * Schema del form: tutto arriva come stringa da `FormData`, quindi la
 * conversione fa parte della validazione e non del componente.
 */
export const mangaFormSchema = z.object({
  seriesUrl: z.string().trim().url(),
  chapterUrl: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  title: z.string().trim().min(1).max(300),
  // Arriva da un campo nascosto riempito dall'estrazione: va validato come
  // qualunque altro input, perche' il campo resta modificabile dal browser.
  coverUrl: z
    .string()
    .trim()
    .url()
    .max(2000)
    .refine((value) => /^https?:\/\//i.test(value), { message: "scheme" })
    .optional()
    .or(z.literal("").transform(() => undefined)),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  currentChapter: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) return null;
      // La virgola decimale e' normale scrivendo in italiano.
      const parsed = Number.parseFloat(value.replace(",", "."));
      return Number.isFinite(parsed) ? parsed : null;
    })
    .refine((value) => value === null || value >= 0, { message: "negative" }),
  status: readingStatusSchema,
  tags: z.string().transform(parseTags),
});

/** Payload di POST /api/metadata. */
export const metadataRequestSchema = z.object({
  url: z.string().url(),
});
