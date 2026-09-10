-- Loresync - schema iniziale
-- Una sola tabella applicativa: le serie seguite, una riga per utente/serie.
-- L'autenticazione e gli utenti sono gestiti da Supabase Auth (auth.users).

create type reading_status as enum ('in_corso', 'completato', 'in_pausa', 'droppato');

create table manga_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Link alla pagina della serie sulla piattaforma di lettura
  series_url text not null,
  -- Link diretto all'ultimo capitolo letto, quando ricavabile
  chapter_url text,

  title text not null,
  description text,

  -- Decimale: alcune serie numerano i capitoli come 10.5
  current_chapter numeric(8, 2),

  status reading_status not null default 'in_corso',
  tags text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- La stessa serie non va inserita due volte dallo stesso utente
  constraint manga_entries_user_series_unique unique (user_id, series_url)
);

create index manga_entries_user_id_idx on manga_entries (user_id);
create index manga_entries_tags_idx on manga_entries using gin (tags);

-- Mantiene updated_at coerente senza dover ricordarsene lato applicativo
create function set_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger manga_entries_set_updated_at
  before update on manga_entries
  for each row execute function set_updated_at();

-- Ogni utente vede e modifica solo la propria lista
alter table manga_entries enable row level security;

create policy "manga_entries_select_own"
  on manga_entries for select
  using (auth.uid() = user_id);

create policy "manga_entries_insert_own"
  on manga_entries for insert
  with check (auth.uid() = user_id);

create policy "manga_entries_update_own"
  on manga_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "manga_entries_delete_own"
  on manga_entries for delete
  using (auth.uid() = user_id);
