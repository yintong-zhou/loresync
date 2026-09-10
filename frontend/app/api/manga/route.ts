import { NextResponse } from "next/server";

/**
 * GET  /api/manga  -> elenco delle serie dell'utente autenticato
 * POST /api/manga  -> crea una nuova entry (link, capitolo, tag, stato)
 *
 * L'isolamento per utente e' garantito dalle policy RLS su Supabase:
 * qui si usa il client con la sessione dell'utente, non la service role key.
 *
 * TODO: implementare query e insert; validare il body con lib/validation.
 */
export async function GET() {
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}

export async function POST(request: Request) {
  void request;
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
