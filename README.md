# Project Yield Creator OS v1.1

This build upgrades the v1 prototype to a real Supabase-backed creator account.

## Included
- Supabase email/password signup and login
- Per-user product isolation through RLS
- Persistent products
- Product photo upload to Supabase Storage
- Automatic received timestamp
- Custom deadlines
- Content requirements stored separately and individually completable
- Editable pipeline status
- Archive and permanent delete
- Real dashboard totals from creator data
- Real money totals
- Brand-new creator empty state
- Existing Project Yield visual direction preserved

## Setup
1. Run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Run `supabase/schema.sql` in the Supabase SQL Editor.
5. In Supabase Authentication, enable Email authentication.
6. Run `npm run dev`.

For an existing database where the v1 schema was already applied, the final section of `schema.sql`
adds the v1.1 `archived` field and the `product-images` Storage bucket/policies.

## Next
Smart Intake is intentionally not faked in this release. The next version can add photo/screenshot/link
recognition on top of this now-persistent intake flow.
