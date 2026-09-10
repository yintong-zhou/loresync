// Libreria dell'utente: elenco delle serie con stato, capitolo e "Riprendi lettura".
// TODO: caricare le entry da Supabase (RLS per utente) e collegare filtri/ricerca per tag.
export default function LibraryPage() {
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">La mia libreria</h1>
      <p className="text-sm text-neutral-dark">
        Scaffolding: lista, filtri e ricerca non ancora implementati.
      </p>
    </main>
  );
}
