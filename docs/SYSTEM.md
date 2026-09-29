# SYSTEM.md — Retroica, all three repos
Cross-repo map and decisions. Each repo's own PLAN.md covers its internals.
Lives in `retroica-admin/docs/SYSTEM.md`; the other two repos point here from their CLAUDE.md.

## The business in one paragraph
Retroica is a Czech business selling one-of-a-kind retro electronics (cameras, film gear, audio). The base currency is **CZK**. Every item is unique, so quantity is always 1 and an item sold on one platform must come down everywhere else. The main sales channels are Etsy and Aukro; the Medusa webstore is to be added as another channel. Some items are consigned by other sellers ("owners") who earn a commission.
The webstore so far is a proof of concept and has never taken real orders.

## Repos
| Repo | Role | Stack | Hosting |
|---|---|---|---|
| `retroica` | Public storefront | Next.js 14.2 App Router, React 18, Tailwind 3, shadcn/Radix, Medusa JS SDK, Stripe Elements, Supabase (reviews only) | Vercel (Edge Config flag, Analytics, Speed Insights) |
| `retroica-backend` | Commerce engine | Medusa 2.10.1, Postgres 17, Redis, Stripe payment provider, custom fulfillment provider | Railway (nixpacks) |
| `retroica-admin` | Internal ops tool: inventory, owners, cross-listing, financials | Next.js 14.2, React 18, Tailwind 3, `@supabase/ssr`, Recharts 3, Etsy Open API v3 | Vercel (assumed from its guideline doc) |

## How they connect today
```
Browser ──> retroica (Vercel) ──Medusa store API──> retroica-backend (Railway: Postgres + Redis)
                │                                        └──> Stripe (payment intents)
                ├──Stripe.js (card entry)
                └──Supabase anon key ──> `reviews` table

Staff ──> retroica-admin (Vercel) ──Supabase auth + anon/service key──> Supabase
                                     products, platform_listings, profiles, categories,
                                     category_fields, etsy_tokens, etsy_receipts, etsy_ledger_entries
                                  └──Etsy API v3 (OAuth, auto-refresh) ──> active listings sync
Product images are served from Etsy's CDN (i.etsystatic.com) in both frontends.
```
**There is no link between the admin catalog (Supabase) and the store catalog (Medusa).** The `retroica` value in `platform_listings.platform` is a placeholder for it.

## Cross-repo decisions
Record each as: date, decision, why, who decided.
- 2026-09-29 · **The admin is the master catalog** (B). The admin's Supabase `products` table is the record of what exists, what it costs and who owns it. Etsy, Aukro and the Medusa webstore are channels fed from it (`platform_listings.platform` = `etsy` | `aukro` | `retroica`), and each channel reports sales back so the item is ended everywhere else. That was the point of building the admin.
- 2026-09-29 · **CZK is the base currency** (B). Other currencies are derived from it. Code still assumes EUR in places (backend `update-currency-prices` workflow and admin page, storefront default currency); moving those to CZK is open work.
- 2026-09-29 · **Webstore is a proof of concept**, not live for orders (B). Security fixes in the storefront and backend matter before launch, not as emergencies.
- *(open)* **Is the Supabase project shared** between the storefront's `reviews` and the admin's tables? Unknown from the code.

## Environments and secrets (names only, never values)
- Storefront: `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Vercel Edge Config (`enableCheckout`).
- Backend: `DATABASE_URL`, `REDIS_URL`, `CACHE_REDIS_URL`, `MEDUSA_WORKER_MODE`, `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `JWT_SECRET`, `COOKIE_SECRET`, `STRIPE_API_KEY`, `DISABLE_MEDUSA_ADMIN`, `MEDUSA_BACKEND_URL`.
- Admin: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ETSY_API_KEY`, `ETSY_API_SECRET`, `ETSY_SHOP_ID`.

## State that lives outside git (write it down or export it)
- Medusa regions, currencies, shipping options, sales channel, publishable key: only in the Railway Postgres. `seed.ts` is still Medusa's demo t-shirt seed.
- The whole Supabase schema, RLS policies and the `reviews` table: no migrations in any repo.
- The admin's `/scripts` folder is gitignored, and nothing in `src/` writes `etsy_receipts` or `etsy_ledger_entries`, so the import for the Financials page probably lives there.
