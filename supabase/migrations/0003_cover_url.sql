-- Loresync - copertina della serie
--
-- L'immagine non viene copiata da nessuna parte: si salva solo il link
-- pubblicato dalla piattaforma di lettura (og:image) e il browser lo carica
-- direttamente. Nessun file nostro da conservare, nessuna banda spesa a fare
-- da tramite, e nessun dubbio su chi detiene i diritti dell'immagine.

alter table manga_entries
  add column cover_url text;

-- Il valore finisce nell'attributo `src` di un tag immagine: limitarlo agli
-- schemi http evita che un `javascript:` salvato a mano ci finisca dentro.
alter table manga_entries
  add constraint manga_entries_cover_url_scheme check (
    cover_url is null
    or cover_url ~ '^https?://'
  );
