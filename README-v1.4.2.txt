Project Yield v1.4.2 hotfix

Fixes:
- Authenticated Supabase grants for products and related tables. Existing RLS policies still restrict each creator to their own data.
- Expected intake heading now says "What's coming?"
- Desktop product-photo control is compact; mobile keeps the larger camera-first control.

Apply over the project root, then run:
  npx supabase db push
  npm run build

Do not git push until both succeed.
