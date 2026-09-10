import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase per i Client Component (browser).
 * Usa la publishable key: e' progettata per essere esposta, l'accesso ai dati
 * resta governato dalle policy RLS su `manga_entries`.
 */
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
