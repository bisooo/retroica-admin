# CLAUDE.md — retroica-admin

Internal tool for Retroica (Czech retro electronics business, base currency CZK) and **the master catalog**: product inventory, consignment owners and commissions, cross-listing to Etsy / Aukro / the Retroica store, and financials. Next.js 14.2 App Router + React 18, Tailwind 3 + shadcn, `@supabase/ssr` auth and data, Recharts, Etsy Open API v3.
Cross-repo map and decisions: `docs/SYSTEM.md`. Status and roadmap: `PLAN.md`. Session log: `HISTORY.md`. Design and code-style notes: `docs/guideline.md`.

## Hard rules: do not violate these while moving fast
0. **This is the source of truth.** A product exists, has a price and has an owner because the admin says so. Etsy, Aukro and the Medusa webstore are channels: the admin pushes to them and pulls sales back. No channel is allowed to be the only place a fact lives.
1. **Being logged in is not being staff.** Every dashboard route and every server action checks that the user is on the staff allowlist, and Supabase RLS enforces the same on every table. Supabase sign-ups must stay disabled.
2. **Service-role code re-checks the caller.** Anything using `SUPABASE_SERVICE_ROLE_KEY` (Etsy tokens, Etsy sync) lives in server-only modules (`import "server-only"`) and verifies the staff session first. Server actions are public POST endpoints. `syncEtsyListings` does not check the caller today; that is the first fix.
3. **An item sells once.** When a listing sells on any platform, the product is marked sold and its other listings are ended. Never mark something sold on absence alone without saying so: the current sync treats "not in Etsy's active list" as sold, which also catches expired, deactivated and draft listings.
4. **The schema is in git.** Every table, RLS policy and function change is a migration file in this repo (Supabase CLI), and DB types are regenerated after it. Nothing is created only in the dashboard.
5. **Money has a currency; the base is CZK.** Store the currency next to every price and fee (Etsy returns amount/divisor plus currency). Convert to CZK explicitly before summing; never add amounts in different currencies.
6. **Dates are bucketed in the business time zone**, not by slicing UTC ISO strings (Financials currently uses `created_at.slice(0, 7)`).
7. **Etsy tokens never leave the server** and are never logged.

## Commands
- `pnpm dev` / `pnpm build` / `pnpm lint` (clean) / `pnpm exec tsc --noEmit` (clean)
- Package manager: pnpm (`pnpm-lock.yaml`). `package-lock.json` is stale; delete it.
- `/scripts` is gitignored. Anything that writes to the database (e.g. the Etsy receipts import) must move into the repo.

## Data model (Supabase)
`products` (slug, title, price, condition 1-10, specs jsonb, category_id, owner_id, inventory_status, images), `categories` (tree via parent_id/level), `category_fields` (per-category spec fields), `profiles` (owners: name, commission, notes), `platform_listings` (product_id, platform etsy|aukro|retroica, platform_id, status draft|active|sold|paused|needs_sync, price, platform_data), `etsy_tokens` (single row, service-role only), `etsy_receipts`, `etsy_ledger_entries`.

## Framework notes
- Next 14: `middleware.ts`, sync `cookies()` (the code awaits it, which is harmless). Supabase SSR uses the `getAll`/`setAll` cookie pattern already.
- Middleware calls `getUser()` on every request and redirects `/dashboard/*` to `/login` without a session.

## Verification
Playwright MCP against `next dev` with a disposable staff user; confirm an unauthenticated request and a non-staff user are both refused. Etsy calls use a sandbox or read-only calls only unless B says otherwise. Report what was not verified.

## Git
- Commit as B: author and committer `Basel <baselsamy1999@gmail.com>`. No Claude author, no `Co-Authored-By` or "Generated with Claude Code" trailers.
- No branches or PRs. Push small commits straight to `main` once the work is planned, reviewed and verified. Rebase onto `origin/main` first.
- One-line imperative commit messages under ~60 chars.
