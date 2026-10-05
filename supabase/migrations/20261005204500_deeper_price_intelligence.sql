alter table public.products
  add column if not exists current_price numeric(12,2);

comment on column public.products.current_price is 'Current/sale price captured from public product-page metadata or embedded page state when available.';
