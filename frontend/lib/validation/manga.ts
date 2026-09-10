import { z } from "zod";

/** Stati di lettura ammessi (allineati all'enum su Supabase). */
export const readingStatusSchema = z.enum([
  "in_corso",
  "completato",
  "in_pausa",
  "droppato",
]);

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

/** Payload di POST /api/metadata. */
export const metadataRequestSchema = z.object({
  url: z.string().url(),
});
