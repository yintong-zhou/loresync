-- Loresync - profili utente
--
-- `auth.users` e' gestita da Supabase e non va modificata: i dati anagrafici
-- che l'app scrive stanno qui. La riga viene creata da un trigger alla
-- registrazione, cosi' un profilo esiste sempre e le pagine non devono
-- gestire il caso "utente senza profilo".

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  display_name text,

  -- Lingua scelta dall'utente. Il vincolo elenca le lingue gestite: se ne
  -- viene aggiunta una in `lib/i18n/config.ts` va aggiornato anche qui.
  preferred_locale text not null default 'it'
    check (preferred_locale in ('it', 'en')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Vincolo sul contenuto, non solo sul tipo: un nome di un carattere o fatto
  -- di soli spazi non e' un nome.
  constraint profiles_display_name_length check (
    display_name is null
    or char_length(btrim(display_name)) between 2 and 60
  )
);

-- Riusa la funzione definita in 0001_init.sql.
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

alter table profiles enable row level security;

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Nessuna policy di delete: il profilo se ne va con l'utente, per cascata.

/*
 * Crea il profilo alla registrazione.
 *
 * `security definer` serve perche' il trigger gira nel contesto di
 * `auth.users`, dove l'utente appena creato non ha ancora una sessione: senza
 * questo, la policy di insert bloccherebbe la riga. `search_path` fissato per
 * non farlo dipendere dal contesto del chiamante.
 */
create function handle_new_user() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_locale text;
begin
  meta_locale := new.raw_user_meta_data ->> 'preferred_locale';

  insert into public.profiles (id, display_name, preferred_locale)
  values (
    new.id,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), ''),
    -- I metadati arrivano dal client e non sono affidabili: un valore fuori
    -- elenco farebbe fallire il check e con esso l'intera registrazione.
    case when meta_locale in ('it', 'en') then meta_locale else 'it' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
