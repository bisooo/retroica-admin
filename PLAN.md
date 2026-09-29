# PLAN.md — retroica-admin
Lean status doc; full history is in HISTORY.md.

## Current status
Early but working. Supabase email login guards `/dashboard`. Products: table and grid views with category/owner/platform info, product detail by slug, and a "new product" form with per-category spec fields and owner. Financials: gross, fees, net and a monthly chart from imported Etsy receipts and ledger entries, plus active inventory value by owner. Etsy: OAuth tokens stored in `etsy_tokens` with automatic refresh; a Sync button pulls active listings, updates price/state/views and marks missing ones as sold. Customers and Settings pages are placeholders. Aukro and the Retroica store are in the platform enum but have no integration.
Last code change: 2026-04-21 (Etsy token refresh + sync).

## Data model
See CLAUDE.md. Schema lives only in Supabase today; first job is to pull it into migrations.

## Auth / access control summary
Supabase Auth; middleware only checks for a session. No role or allowlist yet. Service-role key used by Etsy token and sync code.

## Scope / build order (proposal; master-catalog decision confirmed 2026-09-29)
1. Lock down: staff allowlist, RLS, auth check in server actions, schema in migrations, scripts in repo.
2. Catalog as source of truth: edit product, images (own storage rather than Etsy CDN), mark sold.
3. Channel: Retroica store (push products to Medusa, pull orders back, end other listings on sale).
4. Channel: Etsy write (create/update/deactivate listings) and order import in-app.
5. Channel: Aukro.
6. Owners: payouts and commission statements.

## Open/Next
- [ ] Auth check in `syncEtsyListings` and `createProduct`.
- [ ] Decide what "not in active listings" means (sold vs expired vs deactivated); Etsy's receipts tell you what actually sold.
- [ ] Remove `package-lock.json`; keep pnpm.
- [ ] Move `/scripts` into the repo (without secrets).
- [ ] Store currency with prices and fees; report in CZK.

## Future ideas
Barcode/label printing for stock, photo pipeline, price suggestions from sold comps.

## Environment notes
Needs a Supabase project with the schema above and a seeded `etsy_tokens` row (OAuth once, then `seedTokens`).

## Deployment
Vercel (per `docs/guideline.md`), env vars in the Vercel dashboard.

## Verification plan
Playwright with a disposable staff user and a disposable non-staff user; Etsy calls read-only.
