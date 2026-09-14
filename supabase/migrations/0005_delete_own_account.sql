-- Chiusura dell'account da parte dell'intestatario.
--
-- La riga sta in `auth.users`, che e' di Supabase: la publishable key con cui
-- gira l'app non puo' toccarla, e nessuna policy RLS potrebbe concederlo
-- perche' quella tabella non e' nostra. Le due strade sono la service role key
-- dentro l'applicazione, oppure questa funzione. Scelta la funzione: una
-- chiave che scavalca la RLS avrebbe dato all'app il potere di cancellare
-- qualunque utente, per ottenere il permesso di cancellarne uno.

/*
 * Cancella l'utente della sessione corrente.
 *
 * Non prende parametri, e questo e' il punto: il bersaglio e' sempre e solo
 * `auth.uid()`, quindi non esiste una chiamata che ne colpisca un altro. Con
 * un argomento `id`, `security definer` avrebbe trasformato la funzione in un
 * modo per cancellare chiunque conoscendone l'identificativo.
 *
 * `security definer` serve perche' il chiamante e' l'utente autenticato, che
 * su `auth.users` non ha diritti di scrittura; la funzione gira invece con
 * quelli del proprietario.
 *
 * `search_path = ''` con i nomi tutti qualificati e' la difesa standard delle
 * funzioni `security definer`: senza, chi chiama potrebbe anteporre al percorso
 * uno schema suo con dentro una `users` fatta apposta, e farsi eseguire il
 * proprio codice con i privilegi del proprietario.
 *
 * `manga_entries.user_id` e `profiles.id` referenziano `auth.users (id)` con
 * `on delete cascade`: la libreria e il profilo se ne vanno da soli. Cancellarli
 * qui a mano sarebbe una seconda verita' da tenere allineata alla prima.
 */
create function public.delete_own_account() returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Senza sessione `auth.uid()` e' null, e `delete ... where id = null` non
  -- cancellerebbe niente restituendo comunque successo. L'eccezione rende la
  -- chiamata senza sessione un errore invece di un silenzio.
  if auth.uid() is null then
    raise exception 'delete_own_account richiede una sessione';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

-- `execute` e' concesso a `public` per default: senza questa revoca la
-- funzione sarebbe chiamabile anche da `anon`, cioe' da chiunque raggiunga
-- l'endpoint senza aver fatto login. Innocua oggi grazie al controllo qui
-- sopra, ma il permesso giusto e' comunque quello stretto.
revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
