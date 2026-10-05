-- Project Yield v1.6: creator value + payment tracking
alter table public.products
  add column if not exists posted_url text,
  add column if not exists payment_status text not null default 'expected',
  add column if not exists paid_at timestamptz;

do $$ begin
  alter table public.products add constraint products_payment_status_check
    check (payment_status in ('expected','waiting','paid'));
exception when duplicate_object then null;
end $$;

create index if not exists products_user_payment_idx
  on public.products(user_id, payment_status);
