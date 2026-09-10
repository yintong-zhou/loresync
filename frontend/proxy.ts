import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Convenzione "proxy" di Next 16: sostituisce "middleware", deprecato dalla 16.
// Next cerca l'export nominato `proxy` (con fallback sul default).
export const proxy = (request: NextRequest) => updateSession(request);

export const config = {
  matcher: [
    // Tutto tranne asset statici e immagini: qui si fa una chiamata di rete per
    // richiesta, non va sprecata su file statici.
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
