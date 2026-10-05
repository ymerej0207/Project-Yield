# Project Yield Creator OS v1.3

Core direction: **Expected -> Received -> Content -> Posted -> Paid**

## Cost rule
This build contains no OpenAI API, paid Google API, AI credits, or metered recognition service.

## v1.3 foundation
- Expected vs Received product intake
- TikTok Shop title and optional product/campaign link
- Saved free Google Shopping search reference generated from the title
- Product description/details stored for future Content Workspace use
- Product foundation fields for brand, model, category, barcode, lifecycle timestamps and content workspace
- Per-user creator profile table with creator voice and speaking speed
- Zero-cost rules-based 30/60/90/120 second script-builder module
- Free browser-native barcode detection helper where supported
- Expected-product text matching helper for future local/browser OCR integration

No paid AI recognition remains.

## Migration
`supabase/migrations/20261005173000_project_yield_v13_foundation.sql`

## Deploy
```powershell
npx supabase db push
npm run build
git add .
git commit -m "Project Yield v1.3 Creator OS foundation"
git push
```

If `npm run build` succeeds, Vercel will automatically deploy after the push.
