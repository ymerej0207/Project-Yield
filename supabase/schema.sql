create extension if not exists pgcrypto;
create type product_source as enum ('Amazon Vine','Amazon Creator Connections','TikTok Shop','Brand Direct','Purchased','Other');
create type product_status as enum ('Received','Need to Film','Filmed','Editing','Ready to Post','Posted','Waiting on Payment','Complete');

create table public.creator_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text, created_at timestamptz not null default now()
);
create table public.products (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null, source product_source not null default 'Other',
 received_at timestamptz not null default now(), due_at date,
 status product_status not null default 'Received',
 product_value numeric(12,2) not null default 0,
 compensation numeric(12,2) not null default 0,
 affiliate_earnings numeric(12,2) not null default 0,
 image_url text, product_url text, notes text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.content_requirements (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 platform text not null, content_type text, status text not null default 'needed',
 posted_url text, posted_at timestamptz
);
create table public.product_events (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 event_type text not null, event_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table public.money_events (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 product_id uuid references public.products(id) on delete set null,
 kind text not null, amount numeric(12,2) not null,
 status text not null default 'expected', due_at date, paid_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.creator_profiles enable row level security;
alter table public.products enable row level security;
alter table public.content_requirements enable row level security;
alter table public.product_events enable row level security;
alter table public.money_events enable row level security;
create policy "profile owner" on public.creator_profiles for all using(auth.uid()=id) with check(auth.uid()=id);
create policy "product owner" on public.products for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "requirement owner" on public.content_requirements for all using(exists(select 1 from public.products p where p.id=product_id and p.user_id=auth.uid())) with check(exists(select 1 from public.products p where p.id=product_id and p.user_id=auth.uid()));
create policy "event owner" on public.product_events for all using(exists(select 1 from public.products p where p.id=product_id and p.user_id=auth.uid())) with check(exists(select 1 from public.products p where p.id=product_id and p.user_id=auth.uid()));
create policy "money owner" on public.money_events for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create index products_user_status_idx on public.products(user_id,status);
create index products_user_due_idx on public.products(user_id,due_at);

alter table public.products add column if not exists archived boolean not null default false;

insert into storage.buckets (id,name,public)
values ('product-images','product-images',true)
on conflict (id) do update set public=true;

create policy "product image upload own folder" on storage.objects
for insert to authenticated with check (
 bucket_id='product-images' and (storage.foldername(name))[1]=auth.uid()::text
);
create policy "product image update own folder" on storage.objects
for update to authenticated using (
 bucket_id='product-images' and (storage.foldername(name))[1]=auth.uid()::text
);
create policy "product image delete own folder" on storage.objects
for delete to authenticated using (
 bucket_id='product-images' and (storage.foldername(name))[1]=auth.uid()::text
);
create policy "product image public read" on storage.objects
for select using (bucket_id='product-images');


-- v1.3 fields are applied by migration 20261005173000_project_yield_v13_foundation.sql
