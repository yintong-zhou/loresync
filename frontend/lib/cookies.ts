/**
 * Durata dei cookie di preferenza.
 *
 * Un anno, e in un posto solo. Il valore era ripetuto in quattro punti — tre
 * nel proxy e uno nelle preferenze — e in altri due mancava del tutto: la
 * lingua veniva scritta senza scadenza dal logout e dal cambio lingua, cioe'
 * come cookie di sessione, mentre il commento accanto diceva che doveva
 * sopravvivere al logout. Non si vedeva perche' il proxy la riscriveva con la
 * scadenza giusta alla richiesta successiva, il che rendeva il difetto
 * invisibile e la correttezza dipendente da un altro file.
 *
 * Le preferenze non sono stato di sessione: chi scegli inglese, la griglia o
 * il filtro dei contenuti se li deve ritrovare anche riaprendo il browser il
 * mese dopo.
 */
export const PREFERENCE_MAX_AGE = 60 * 60 * 24 * 365;
