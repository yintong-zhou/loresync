/**
 * Dizionario italiano. E' la fonte di verita': il tipo `Dictionary` deriva da
 * questo oggetto, quindi ogni chiave aggiunta qui diventa obbligatoria nelle
 * altre lingue e la mancanza si vede a compile time, non a pagina aperta.
 */
export const it = {
  meta: {
    title: "Loresync",
    description:
      "Tieni traccia di manga, manhwa e manhua letti online: link, capitolo, e riprendi da dove eri arrivato.",
  },
  common: {
    login: "Accedi",
    languageLabel: "Lingua",
    // Nome della lingua nella lingua stessa: si legge uguale da qualunque
    // pagina, senza dover tradurre l'elenco delle lingue in ogni lingua.
    languageName: "Italiano",
  },
  landing: {
    hero: {
      line1: "Non perdere",
      line2: "più il segno",
      lead: "Segui venti serie in parallelo e ti ricordi dove eri arrivato in tre. Loresync tiene il conto al posto tuo: manga, manhwa e manhua letti online, con il capitolo giusto sempre a un click.",
      cta: "Inizia ora",
    },
    steps: {
      title: "Come funziona",
      items: [
        {
          title: "Incolla il link",
          body: "Il titolo lo ricava Loresync dal link. Tu non lo scrivi.",
        },
        {
          title: "Segna il capitolo",
          body: "Un numero. Poi tag e stato di lettura, se ti servono.",
        },
        {
          title: "Riprendi",
          body: "Un click e si apre il capitolo. O la pagina della serie.",
        },
      ],
    },
    features: {
      title: "Cosa fa",
      items: [
        "Titolo estratto dal link, in automatico",
        "Generi e tag decisi da te, non indovinati",
        "Quattro stati di lettura per ogni serie",
        "Ricerca e filtri per tag",
        "Un account e una lista per ogni lettore",
      ],
    },
    statuses: {
      title: "Stati di lettura",
    },
    limits: {
      line1: "Loresync non",
      line2: "legge per te",
      items: [
        "Nessuna integrazione con le piattaforme di lettura",
        "Nessun sync automatico dei capitoli",
        "Nessuna notifica sui capitoli nuovi",
      ],
      note: "Registra dove sei arrivato, e ti ci riporta. Il resto lo fai tu.",
    },
    final: {
      title: "La tua libreria ti aspetta",
    },
    footer: "Loresync — strumento personale per chi legge troppo",
  },
  // Etichette degli stati di lettura. Le chiavi sono i valori dell'enum
  // `reading_status` su Postgres: i dati restano invariati, cambia l'etichetta.
  readingStatus: {
    in_corso: "In corso",
    completato: "Completato",
    in_pausa: "In pausa",
    droppato: "Droppato",
  },
  auth: {
    loginTitle: "Accedi a Loresync",
    loginPlaceholder:
      "Scaffolding: il form di autenticazione non è ancora implementato.",
  },
  library: {
    title: "La mia libreria",
    placeholder:
      "Scaffolding: lista, filtri e ricerca non sono ancora implementati.",
  },
  addManga: {
    title: "Aggiungi una serie",
    placeholder: "Scaffolding: il form non è ancora implementato.",
  },
};

export type Dictionary = typeof it;
