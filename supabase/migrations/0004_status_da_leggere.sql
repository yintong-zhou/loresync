-- Nuovo stato di lettura: "da leggere", per le serie messe da parte e non
-- ancora cominciate. Prima esistevano solo stati che presuppongono di aver
-- gia' aperto qualcosa, e una serie segnata per dopo finiva in "in pausa",
-- che vuol dire un'altra cosa.

-- `before 'in_corso'` fissa la posizione nell'ordinamento dell'enum, che e'
-- quello di dichiarazione e non quello alfabetico: cosi' un `order by status`
-- segue il ciclo di vita — da leggere, in corso, e poi come e' finita.
--
-- `add value` sta in transazione da Postgres 12 in avanti, a patto che il
-- valore nuovo non venga usato nella stessa transazione. Qui non lo e': questa
-- migration lo dichiara soltanto.
-- `if not exists` la rende ripetibile: rilanciarla non e' un errore, e' un
-- nulla di fatto.
alter type reading_status add value if not exists 'da_leggere' before 'in_corso';

-- Nessun aggiornamento delle righe esistenti e nessun cambio di default: il
-- default resta 'in_corso', perche' chi aggiunge una serie di solito la sta
-- gia' leggendo, e riclassificare da fuori serie che qualcuno ha gia' messo
-- in pausa sarebbe una decisione presa al posto suo.
