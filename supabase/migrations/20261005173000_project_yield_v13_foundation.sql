alter table public.products
  add column if not exists lifecycle_state text not null default 'received',
  add column if not exists expected_at timestamptz,
  add column if not exists source_url text,
  add column if not exists reference_url text,
  add column if not exists product_description text,
  add column if not exists brand text,
  add column if not exists model text,
  add column if not exists category text,
  add column if not exists barcode text,
  add column if not exists content_workspace jsonb not null default '{}'::jsonb;

update public.products
set received_at = coalesce(received_at, created_at)
where lifecycle_state = 'received'
  and received_at is null;

alter table public.creator_profiles
  add column if not exists creator_voice text
    not null default 'natural, conversational, useful, not overly salesy',
  add column if not exists speaking_wpm integer
    not null default 145,
  add column if not exists updated_at timestamptz
    not null default now();

alter table public.creator_profiles
  drop constraint if exists creator_profiles_speaking_wpm_check;

alter table public.creator_profiles
  add constraint creator_profiles_speaking_wpm_check
  check (speaking_wpm between 80 and 240);

alter table public.creator_profiles enable row level security;

drop policy if exists "creator_profiles_select_own"
  on public.creator_profiles;

create policy "creator_profiles_select_own"
  on public.creator_profiles
  for select
  using (auth.uid() = id);

drop policy if exists "creator_profiles_insert_own"
  on public.creator_profiles;

create policy "creator_profiles_insert_own"
  on public.creator_profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "creator_profiles_update_own"
  on public.creator_profiles;

create policy "creator_profiles_update_own"
  on public.creator_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);