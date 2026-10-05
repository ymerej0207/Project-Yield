-- Project Yield v1.7: preserve crawled listed price separately from creator product value
alter table public.products
  add column if not exists listed_price numeric(12,2),
  add column if not exists product_value_manual boolean not null default false;

comment on column public.products.listed_price is 'Public retail/listed price captured from product metadata when available.';
comment on column public.products.product_value is 'Creator-recorded product value. Defaults to listed price when no manual override is supplied.';
comment on column public.products.product_value_manual is 'True when the creator explicitly overrides the default product value.';
