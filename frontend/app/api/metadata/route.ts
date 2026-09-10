import { NextResponse } from "next/server";

/**
 * POST /api/metadata
 * Body: { url: string }
 * Ritorna: { title: string, description?: string, sourceHost: string }
 *
 * Estrae i metadata (OpenGraph / <title>) dalla pagina indicata dal link.
 * Il fetch avviene solo lato server: vedi directives/extract_manga_metadata.md
 * per la SOP e i selettori per piattaforma.
 *
 * TODO: implementare fetch + parsing con i parser di lib/metadata.
 */
export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    { error: "not_implemented", message: "Estrazione metadata non ancora implementata." },
    { status: 501 },
  );
}
