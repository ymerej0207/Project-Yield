-- v1.4.2: restore authenticated API access while RLS continues to enforce ownership.
-- RLS policies remain the security boundary. These grants only allow authenticated
-- requests to reach those policies.

grant usage on schema public to authenticated;

grant select, insert, update, delete on table public.products to authenticated;
grant select, insert, update, delete on table public.content_requirements to authenticated;
grant select, insert, update, delete on table public.product_events to authenticated;
grant select, insert, update, delete on table public.money_events to authenticated;
grant select, insert, update, delete on table public.creator_profiles to authenticated;
