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
  nav: {
    library: "Libreria",
    add: "Aggiungi",
    account: "Account",
  },
  auth: {
    loginTitle: "Accedi a Loresync",
    signUpTitle: "Crea un account",
    emailLabel: "Email",
    passwordLabel: "Password",
    passwordHint: "Almeno 8 caratteri.",
    displayNameLabel: "Nome visualizzato",
    displayNameHint: "Facoltativo. Puoi impostarlo anche dopo, dall'account.",
    signInCta: "Accedi",
    signUpCta: "Registrati",
    toSignUp: "Non hai un account? Registrati",
    toSignIn: "Hai già un account? Accedi",
    pending: "Attendi...",
    checkEmail:
      "Ti abbiamo mandato una mail di conferma. Aprila per attivare l'account.",
    errors: {
      // Volutamente identico per email inesistente e password sbagliata: un
      // messaggio diverso direbbe a chiunque quali indirizzi sono registrati.
      invalidCredentials: "Email o password non validi.",
      invalidInput: "Controlla i dati inseriti.",
      emailTaken: "Esiste già un account con questa email.",
      weakPassword: "La password deve avere almeno 8 caratteri.",
      rateLimited: "Troppi tentativi. Riprova fra qualche minuto.",
      samePassword: "La nuova password è uguale a quella attuale.",
      invalidLink: "Il link non è più valido. Richiedine uno nuovo.",
      generic: "Qualcosa è andato storto. Riprova.",
    },
  },
  account: {
    title: "Account",
    profileSection: "Profilo",
    emailSection: "Email",
    passwordSection: "Password",
    preferredLocaleLabel: "Lingua preferita",
    preferredLocaleHint:
      "Cambia anche la lingua dell'interfaccia, subito dopo il salvataggio.",
    currentEmail: "Email attuale",
    newEmailLabel: "Nuova email",
    emailChangeHint:
      "Il cambio diventa effettivo solo dopo aver aperto il link di conferma.",
    emailChangeRequested:
      "Ti abbiamo mandato una mail al nuovo indirizzo. Confermala per completare il cambio.",
    newPasswordLabel: "Nuova password",
    confirmPasswordLabel: "Conferma password",
    passwordMismatch: "Le due password non coincidono.",
    passwordChanged: "Password aggiornata.",
    save: "Salva",
    saved: "Salvato.",
    pending: "Salvataggio...",
    signOut: "Esci",
    errors: {
      invalidInput: "Controlla i dati inseriti.",
      notSignedIn: "Sessione scaduta. Accedi di nuovo.",
      weakPassword: "La password deve avere almeno 8 caratteri.",
      generic: "Non è stato possibile salvare. Riprova.",
    },
  },
  library: {
    title: "La mia libreria",
    searchLabel: "Cerca",
    searchPlaceholder: "Titolo o descrizione",
    anyStatus: "Tutti",
    anyTag: "Tutti",
    filter: "Filtra",
    clear: "Azzera",
    viewLabel: "Vista",
    viewList: "Elenco",
    viewGrid: "Griglia",
    adultShow: "Mostra i contenuti per adulti",
    adultHide: "Nascondi i contenuti per adulti",
    sortLabel: "Ordina",
    sortNewest: "Più recenti",
    sortOldest: "Meno recenti",
    sortAz: "A-Z",
    sortZa: "Z-A",
    paginationLabel: "Pagine",
    page: "Pagina",
    prevPage: "Precedente",
    nextPage: "Successiva",
    empty: "Non hai ancora aggiunto niente. Comincia dal link di una serie.",
    noResults: "Nessuna serie con questi filtri.",
  },
  manga: {
    addTitle: "Aggiungi una serie",
    seriesUrlLabel: "Link della serie",
    seriesUrlHint: "Incolla il link: il titolo lo ricava Loresync.",
    lookupPending: "Sto leggendo il titolo dal link...",
    lookupFailed: "Titolo non ricavabile da questo link: scrivilo a mano.",
    coverFound: "Copertina trovata sul sito di origine.",
    titleLabel: "Titolo",
    titleHint: "Correggilo pure: quello che viene salvato è questo.",
    chapterLabel: "Capitolo",
    chapterShort: "cap.",
    chapterHint: "Nel link risulta il capitolo",
    chapterUrlLabel: "Link del capitolo (facoltativo)",
    chapterUrlHint: "Se lo incolli, «Riprendi» apre direttamente il capitolo.",
    statusLabel: "Stato",
    tagsLabel: "Tag",
    tagsHint: "Separati da virgola. Per esempio: azione, fantasy",
    descriptionLabel: "Descrizione (facoltativa)",
    descriptionHint: "Serve solo se ti aiuta a riconoscere la serie.",
    descriptionEditHint: "Svuota il campo per cancellarla.",
    submit: "Aggiungi",
    pending: "Salvataggio...",
    save: "Salva",
    saved: "Salvato.",
    edit: "Modifica",
    delete: "Elimina",
    deleteConfirm: "Confermi? Elimina",
    resumeChapter: "Riprendi il capitolo",
    openSeries: "Apri la serie",
    noValidLink: "Link non valido",
    staleLink: "Il link salvato punta a un altro capitolo: reincollalo.",
    errors: {
      invalidInput: "Controlla i dati inseriti.",
      duplicate: "Questa serie è già in libreria.",
      generic: "Non è stato possibile salvare. Riprova.",
    },
  },
};

export type Dictionary = typeof it;
