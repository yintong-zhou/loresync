// Layout dell'area autenticata.
// TODO: verificare la sessione Supabase lato server e redirigere a /login se assente.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-6 flex items-baseline justify-between border-b border-neutral-light pb-4">
        <span className="text-lg font-semibold">Loresync</span>
        {/* TODO: navigazione + logout */}
      </header>
      {children}
    </div>
  );
}
