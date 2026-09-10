import { redirect } from "next/navigation";

// Landing: per ora rimanda direttamente alla libreria.
// TODO: mostrare una pagina pubblica di presentazione quando l'utente non e' autenticato.
export default function HomePage() {
  redirect("/library");
}
