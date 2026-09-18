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
    // Nominano l'azione del pulsante, non lo stato del campo: e' la regola
    // che segue gia' il toggle dei contenuti per adulti.
    passwordShow: "Mostra la password",
    passwordHide: "Nascondi la password",
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
    da_leggere: "Da leggere",
    in_corso: "In corso",
    completato: "Completato",
    in_pausa: "In pausa",
    droppato: "Droppato",
  },
  nav: {
    dashboard: "Dashboard",
    library: "Libreria",
    add: "Aggiungi",
    account: "Account",
  },
  dashboard: {
    title: "A che punto sei",
    empty: "Non hai ancora aggiunto niente. Comincia dal link di una serie.",
    statsSection: "Numeri",
    // "Raggiunti" e non "letti": e' la somma dell'ultimo capitolo segnato in
    // ogni serie, e i dati non dicono niente su cosa sia stato aperto davvero.
    chaptersRead: "Capitoli raggiunti",
    series: "Serie",
    // `{days}` viene sostituito con il numero di giorni della finestra.
    recent: "Attive · {days} gg",
    statusSection: "Per stato",
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
    confirmPasswordLabel: "Conferma password",
    passwordMismatch: "Le due password non coincidono.",
    errors: {
      // Volutamente identico per email inesistente e password sbagliata: un
      // messaggio diverso direbbe a chiunque quali indirizzi sono registrati.
      invalidCredentials: "Email o password non validi.",
      emailNotConfirmed:
        "Devi confermare l'email prima di accedere. Controlla la posta, " +
        "anche nella cartella dello spam.",
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
    deleteSection: "Elimina account",
    deleteWarning:
      "Cancella l'account, l'intera libreria e tutto quello che ci hai " +
      "messo dentro. Non si torna indietro e non c'è una copia da cui " +
      "ripescare.",
    deleteCta: "Elimina il mio account",
    deletePasswordLabel: "Conferma con la tua password",
    deleteConfirm: "Elimina definitivamente",
    errors: {
      invalidInput: "Controlla i dati inseriti.",
      notSignedIn: "Sessione scaduta. Accedi di nuovo.",
      weakPassword: "La password deve avere almeno 8 caratteri.",
      wrongPassword: "Password errata. L'account non è stato toccato.",
      generic: "Non è stato possibile salvare. Riprova.",
    },
  },
  legal: {
    backHome: "Torna alla home",
    cookie: {
      title: "Cookie",
      intro:
        "Loresync usa solo cookie tecnici: quelli che servono a tenere " +
        "l'accesso aperto e a ricordare le scelte fatte nell'interfaccia. " +
        "Non c'è nulla da accettare o rifiutare, perché senza questi il sito " +
        "non funzionerebbe o dimenticherebbe le preferenze a ogni pagina.",
      tableName: "Nome",
      tablePurpose: "A cosa serve",
      tableDuration: "Durata",
      rows: {
        session: {
          name: "sb-<progetto>-auth-token",
          purpose:
            "Mantiene l'accesso: identifica la sessione dopo il login. È " +
            "impostato da Supabase, il servizio che gestisce autenticazione e " +
            "database.",
          duration: "Durata della sessione, rinnovata navigando",
        },
        locale: {
          name: "NEXT_LOCALE",
          purpose: "Ricorda la lingua scelta.",
          duration: "Un anno",
        },
        view: {
          name: "loresync-view",
          purpose: "Ricorda se la libreria si apre a elenco o a griglia.",
          duration: "Un anno",
        },
        adult: {
          name: "loresync-adult",
          purpose: "Ricorda se i contenuti per adulti sono nascosti.",
          duration: "Un anno",
        },
        notice: {
          name: "loresync-cookie-notice",
          purpose:
            "Ricorda che questa informativa è stata letta, per non " +
            "riproporla a ogni pagina.",
          duration: "Un anno",
        },
      },
      noProfiling:
        "Nessuno di questi cookie è di terze parti, nessuno profila e nessuno " +
        "segue la navigazione fuori da questo sito. Non sono installati " +
        "strumenti di analisi del traffico, né pixel, né script pubblicitari.",
      manageHeading: "Come cancellarli",
      manage:
        "I cookie si cancellano e si bloccano dalle impostazioni del " +
        "browser. Bloccando quello di sessione l'accesso smette di " +
        "funzionare; bloccando gli altri le preferenze tornano ai valori " +
        "iniziali a ogni visita.",
    },
    privacy: {
      title: "Privacy",
      whatHeading: "Quali dati vengono raccolti",
      whatAccount:
        "Dell'account: indirizzo email, password, e se li si compila nome " +
        "visualizzato e lingua preferita. La password non viene mai " +
        "conservata in chiaro né è visibile a nessuno: Supabase ne " +
        "custodisce solo una versione cifrata, con cui si può verificare se " +
        "quella digitata è giusta ma non risalire alla password stessa.",
      whatLibrary:
        "Della libreria: i link che si incollano, il capitolo raggiunto, il " +
        "titolo, la descrizione e la copertina ricavati dalla pagina, i tag " +
        "assegnati e lo stato di lettura.",
      whyHeading: "Perché",
      why:
        "I dati dell'account servono a far funzionare l'accesso e a " +
        "distinguere una libreria dall'altra. I dati della libreria sono il " +
        "contenuto che l'utente inserisce, e conservarlo è la ragione per cui " +
        "il servizio esiste. Non vengono usati per altro.",
      whoHeading: "Chi altro li tratta",
      whoSupabase:
        "Supabase, per il database e l'autenticazione: è dove i dati sono " +
        "effettivamente conservati.",
      whoResend:
        "Resend, solo per la consegna delle email di servizio — conferma " +
        "dell'indirizzo, cambio email, recupero password. Riceve " +
        "l'indirizzo del destinatario e il contenuto di quei messaggi, e " +
        "nient'altro.",
      notHeading: "Cosa non viene fatto",
      not:
        "Nessuna analisi del traffico, nessuna profilazione, nessuna " +
        "pubblicità, nessuna decisione automatizzata sulle persone, nessuna " +
        "cessione o vendita dei dati a terzi. Le librerie non sono visibili " +
        "fra utenti: ognuno vede solo la propria.",
      rightsHeading: "I tuoi diritti",
      rightsIntro:
        "Il regolamento europeo riconosce il diritto di accedere ai propri " +
        "dati, correggerli, cancellarli, limitarne il trattamento, " +
        "riceverli in un formato leggibile, opporsi al trattamento e " +
        "presentare reclamo a un'autorità di controllo.",
      rightsInProduct:
        "Due si esercitano direttamente dall'applicazione, senza chiedere " +
        "niente a nessuno: dalla pagina Account si correggono nome, lingua, " +
        "email e password, e l'eliminazione dell'account cancella l'utenza " +
        "e con essa l'intera libreria.",
    },
  },
  notice: {
    text:
      "Questo sito usa solo cookie tecnici: tengono aperto l'accesso e " +
      "ricordano lingua, vista e filtro dei contenuti. Non ci sono cookie " +
      "di profilazione e non c'è niente da accettare.",
    cta: "Ho capito",
    cookieLink: "Informativa cookie",
    privacyLink: "Privacy",
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
