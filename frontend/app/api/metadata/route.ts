import { NextResponse } from "next/server";
import { extractMetadata, type MetadataErrorCode } from "@/lib/metadata/extract";
import { createClient } from "@/lib/supabase/server";
import { metadataRequestSchema } from "@/lib/validation/manga";

/** Il guardrail SSRF risolve i DNS: serve il runtime Node, non l'edge. */
export const runtime = "nodejs";

/** Status per codice, dalla tabella della direttiva. */
const STATUS: Record<MetadataErrorCode, number> = {
  invalid_url: 400,
  blocked_host: 400,
  unsupported_content: 415,
  fetch_failed: 502,
  fetch_timeout: 504,
  needs_manual: 422,
};

/**
 * POST /api/metadata — estrae titolo e descrizione da un link.
 * Vedi `directives/extract_manga_metadata.md`.
 */
export async function POST(request: Request) {
  // Solo utenti autenticati: senza questo, l'endpoint sarebbe un downloader
  // aperto a chiunque, utilizzabile per scaricare pagine a nome del server.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  const parsed = metadataRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  const result = await extractMetadata(parsed.data.url);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.code },
      { status: STATUS[result.code] },
    );
  }

  return NextResponse.json({
    title: result.title,
    description: result.description,
    coverUrl: result.coverUrl,
    sourceHost: result.sourceHost,
    chapterHint: result.chapterHint,
    canonicalUrl: result.canonicalUrl,
  });
}
