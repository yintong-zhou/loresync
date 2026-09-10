# Loresync

## Idea in breve
Piattaforma web per tenere traccia della lettura di manga, manhwa e manhua letti online. L'utente inserisce manualmente link e capitolo tramite un form; il sistema estrae automaticamente titolo (ed eventualmente descrizione) dal link. Nessuna integrazione diretta con le piattaforme di lettura in questa fase.

## Problema e opportunità
Chi segue più serie in parallelo perde facilmente il filo di dove era arrivato in ciascuna. Allo stesso tempo manca un posto dove tenere uno storico/libreria organizzata di tutto ciò che si è letto.

## Obiettivo e target
Uno strumento personale, pensato per l'utente e un piccolo gruppo di amici/conoscenti che leggono manga online. Ogni utente ha il proprio account e la propria lista separata.

## Scope

**Dentro:**
- Form per aggiungere manualmente un manga: link + capitolo raggiunto
- Estrazione automatica del titolo dal link
- Estrazione della descrizione solo se opzionale/necessaria a riconoscere il manga (non sempre mostrata)
- Genere/tag assegnati manualmente da chi aggiunge il manga
- Stato di lettura per ogni serie: In corso / Completato / In pausa / Droppato
- Pulsante "Riprendi lettura" nella lista, che reindirizza alla pagina del manga o, quando possibile, direttamente al capitolo
- Filtro e ricerca per genere/tag
- Sistema di login/account, con lista separata per ogni utente

**Fuori (per ora):**
- Integrazione diretta con le piattaforme di lettura (nessuno scraping automatico in tempo reale, nessun sync automatico dei capitoli, nessuna notifica su nuovi capitoli usciti)

## Funzionalità / requisiti principali
- Form di inserimento manga (link + capitolo)
- Estrazione automatica di titolo (e descrizione, se necessaria) dal link inserito
- Assegnazione manuale di genere/tag
- Gestione stato lettura (In corso / Completato / In pausa / Droppato)
- Pulsante "Riprendi lettura" → redirect alla pagina del manga o del capitolo
- Filtro e ricerca per genere/tag
- Sistema di login/account multi-utente, ciascuno con la propria lista

## Risorse necessarie
- **Stack tecnico:** React + Node.js + Supabase (stack già in uso per altri progetti)
- Da definire in fase tecnica: metodo di estrazione titolo/descrizione dal link (parsing lato server per ciascuna piattaforma sorgente)

## Timeline e milestone
| Milestone | Scadenza |
|---|---|
| Versione funzionante (MVP) | Entro poche settimane |
