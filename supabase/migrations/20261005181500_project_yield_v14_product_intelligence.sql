-- Expected products do not have a received timestamp until they physically arrive.
alter table public.products alter column received_at drop not null;

create index if not exists products_user_lifecycle_idx
  on public.products(user_id, lifecycle_state);
