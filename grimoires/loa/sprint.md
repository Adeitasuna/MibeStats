# Sprint Plan: MibeStats — NFT Analytics Dashboard

**Version**: 1.0.0
**Date**: 2026-02-20
**PRD**: grimoires/loa/prd.md (v1.0.0)
**SDD**: grimoires/loa/sdd.md (v1.0.0)
**Cycle**: cycle-030
**Global Sprint IDs**: sprint-25, sprint-26, sprint-27

---

## Overview

3 sprints, 1 week each, 1 solo developer. Deliverable: MibeStats publicly live on Vercel at end of sprint-3.

| Sprint | Global ID | Theme | Deliverable |
|--------|-----------|-------|-------------|
| Sprint 1 | sprint-25 | Foundation + Collection Overview | Vercel deployment, live floor price, data pipeline |
| Sprint 2 | sprint-26 | Traits + Sales History | Rarity explorer, trait filters, sales charts |
| Sprint 3 | sprint-27 | Portfolio + Security + Polish | Wallet search, security hardening, E2E tests |

---

## Requirements Traceability

| Requirement | Sprint |
|------------|--------|
| F1.1 Floor price ≤ 5 min | Sprint 1 |
| F1.2 Volume metrics 24h/7d/30d/all-time | Sprint 1 |
| F1.3 Total sales + unique holders | Sprint 1 |
| F1.4 Floor price chart over time | Sprint 1 |
| F1.5 Recent sales feed | Sprint 1 |
| F1.6 Top sales all-time | Sprint 1 |
| F2.1 Trait distribution | Sprint 2 |
| F2.2 Swag Score + Swag Rank | Sprint 2 |
| F2.3 Trait filter (combinable) | Sprint 2 |
| F2.4 Token grid (image, ID, rank, floor) | Sprint 2 |
| F2.5 Magic Eden link per token | Sprint 2 |
| F2.6 Rarity leaderboard (top 100 SSS/SS) | Sprint 2 |
| F3.1 Price chart (all sales over time) | Sprint 2 |
| F3.2 Volume bar chart | Sprint 2 |
| F3.3 Filterable sales table | Sprint 2 |
| F4.1 Wallet address lookup | Sprint 3 |
| F4.2 Holdings grid | Sprint 3 |
| F4.3 Portfolio estimated value | Sprint 3 |
| F4.4 Optional wallet connect (RainbowKit) | Sprint 3 |
| F4.5 Per-token sale stats in portfolio | Sprint 3 |

---

## Sprint 1 — Foundation + Collection Overview

**Goal**: Project bootstrapped, data fully indexed in PostgreSQL, Collection Overview page live on Vercel. The pipeline replaces the existing Google Sheets approach.

**Duration**: 1 week
**Global ID**: sprint-25

### Task S1-T1 — Project Bootstrap

**Description**: Initialize the Next.js 14 project with all base dependencies. Configure TypeScript, Tailwind CSS, ESLint, and Prettier. Set up Supabase project and connect Prisma.

**Acceptance Criteria**:
- [ ] `npx create-next-app@latest mibestats --typescript --tailwind --app` executed
- [ ] Prisma installed and `schema.prisma` created with all tables from SDD §5.1
- [ ] `prisma migrate dev` runs without errors on Supabase dev DB
- [ ] `DATABASE_URL` set in `.env.local` and Vercel env vars
- [ ] `next build` passes with zero TypeScript errors
- [ ] `eslint src/` passes with zero errors
- [ ] `.env.example` documents all required env vars

**Effort**: S (half-day)
**Dependencies**: Supabase project created, Vercel account linked to GitHub repo

---

### Task S1-T2 — Database Schema

**Description**: Define and apply the full PostgreSQL schema via Prisma migrations. All tables from SDD §5.1: `tokens`, `sales`, `collection_stats`, `floor_price_history`, `sync_state`. Create all indexes.

**Acceptance Criteria**:
- [ ] `tokens` table: all 28 fields from mibera-codex schema + `rarity_rank`, `owner_address`, sale fields, `is_grail`, `image_url`
- [ ] `sales` table: `tx_hash UNIQUE` constraint (dedup guard)
- [ ] `collection_stats` table: singleton row enforced with `CHECK (id = 1)`
- [ ] `floor_price_history` table: `DATE UNIQUE` constraint
- [ ] `sync_state` table with `key` TEXT PRIMARY KEY
- [ ] All indexes from SDD applied (8 indexes on `tokens`, 3 on `sales`)
- [ ] `prisma generate` produces correct TypeScript types
- [ ] Migration SQL stored in `prisma/migrations/`

**Effort**: M (half-day)
**Dependencies**: S1-T1

---

### Task S1-T3 — mibera-codex Import Script

**Description**: Write `scripts/import-codex.ts` that fetches `miberas.jsonl` and `grails.jsonl` from the mibera-codex GitHub raw CDN, parses all 10,000 tokens, and bulk-inserts into the `tokens` table. Marks grail tokens. Computes `rarity_rank` for all tokens after insert.

**Acceptance Criteria**:
- [ ] Fetches from `https://raw.githubusercontent.com/0xHoneyJar/mibera-codex/main/_codex/data/miberas.jsonl`
- [ ] Fetches from `https://raw.githubusercontent.com/0xHoneyJar/mibera-codex/main/_codex/data/grails.jsonl`
- [ ] Validates each record against Zod schema (28 fields, no additionalProperties)
- [ ] Bulk inserts using `prisma.token.createMany()` in batches of 500
- [ ] Skips duplicates on `token_id` (upsert semantics for re-runs)
- [ ] After insert: computes `rarity_rank` via SQL `RANK() OVER (ORDER BY swag_score DESC)` and updates all rows
- [ ] Marks 42 grail tokens: `is_grail = true`, `grail_name`, `grail_category`
- [ ] Logs progress: `Imported N/10000 tokens...`
- [ ] Final assertion: `SELECT COUNT(*) FROM tokens` = 10000
- [ ] Idempotent: re-running does not duplicate data

**Effort**: M (1 day)
**Dependencies**: S1-T2

---

### Task S1-T4 — Magic Eden API Wrapper

**Description**: Write `lib/me-api.ts` — a typed wrapper around the Magic Eden API. Covers collection stats and sales endpoints. Handles auth (Bearer token), retries (3 attempts, exponential backoff), and error normalisation.

**Acceptance Criteria**:
- [ ] `getCollectionStats()` → typed `CollectionStats` object (floor, volumes, total_sales, total_holders)
- [ ] `getSales(options: { limit, continuation? })` → typed paginated sales response
- [ ] All API calls use server-side env var `ME_BEARER_TOKEN` (never exposed to client)
- [ ] 3-attempt retry with exponential backoff on 429 and 5xx responses
- [ ] Throws typed `MEApiError` on unrecoverable errors
- [ ] Unit test: mock fetch, verify retry logic and response parsing

**Effort**: S (half-day)
**Dependencies**: S1-T1

---

### Task S1-T5 — Historical Sales Import Script

**Description**: Write `scripts/import-sales.ts` that bulk-imports all historical Magic Eden sales for the Mibera333 collection. Paginated (100/page), rate-limited (0.6s between pages), deduplicates via `tx_hash UNIQUE`.

**Acceptance Criteria**:
- [ ] Paginates through all ME sales using `continuation` token until exhausted
- [ ] 0.6s sleep between each page request
- [ ] Each sale record: `token_id`, `price_bera`, `sold_at`, `buyer_address`, `seller_address`, `tx_hash`, `marketplace`
- [ ] Upserts via `createMany({ skipDuplicates: true })` — safe to re-run
- [ ] Updates `sync_state` key `sales_last_synced` with ISO timestamp on completion
- [ ] Logs: `Imported N sales (page X)...`
- [ ] Updates per-token sale stats in `tokens` table (`last_sale_price`, `max_sale_price`, `sale_count`) after import

**Effort**: M (1 day)
**Dependencies**: S1-T4, S1-T2

---

### Task S1-T6 — Berachain RPC Owner Indexer

**Description**: Write `scripts/build-owners.ts` that fetches all Transfer events from the Mibera333 contract on Berachain and builds the current `owner_address` for each token by replaying events (last Transfer wins).

**Acceptance Criteria**:
- [ ] Uses Viem `createPublicClient` with `http(BERACHAIN_RPC_URL)` and chain ID 80094
- [ ] Fetches Transfer events via `getLogs` in batches of 2000 blocks per request
- [ ] Processes blocks from genesis (or `sync_state.owners_last_block`) to latest
- [ ] 0.5s sleep between each `getLogs` batch to avoid RPC rate limits
- [ ] Replays events: for each token_id, last Transfer `to` address wins
- [ ] Bulk updates `tokens.owner_address` using `updateMany` or raw SQL
- [ ] Saves `owners_last_block` in `sync_state` table
- [ ] Idempotent (incremental from last processed block on re-run)
- [ ] Final log: `Updated owner_address for N tokens`

**Effort**: M (1 day)
**Dependencies**: S1-T2

---

### Task S1-T7 — `/api/collection` Route

**Description**: Implement the `GET /api/collection` Next.js Route Handler. On cache miss: fetches fresh data from Magic Eden API, updates `collection_stats` table, returns full response. On cache hit: returns Prisma data directly. Also queries top 20 recent sales and top 10 all-time.

**Acceptance Criteria**:
- [ ] Route at `app/api/collection/route.ts` with `export const revalidate = 300`
- [ ] Fetches `getCollectionStats()` from `lib/me-api.ts` on cache miss
- [ ] Upserts `collection_stats` singleton (INSERT or UPDATE row id=1)
- [ ] Inserts daily `floor_price_history` snapshot if not already recorded today
- [ ] Returns: `CollectionStats` + `recentSales` (last 20, with token image/ID) + `topSales` (top 10 by price)
- [ ] Response shaped as TypeScript `CollectionResponse` type
- [ ] 500ms max query time (no N+1 — single JOIN query for sales with tokens)
- [ ] Returns 503 with cached data if ME API is unreachable

**Effort**: M (1 day)
**Dependencies**: S1-T4, S1-T2

---

### Task S1-T8 — Collection Overview Page

**Description**: Build the `app/page.tsx` Collection Overview page. Displays floor price, volume stats, floor price chart, recent sales feed, and top sales. Mobile-first responsive layout.

**Acceptance Criteria**:
- [ ] `<StatCard>` components: floor price, 24h/7d/30d/all-time volume, total sales, unique holders
- [ ] `<FloorPriceChart>`: Recharts AreaChart using `/api/stats/floor-history` data. Time range selector: 7d / 30d / all-time.
- [ ] `<RecentSalesFeed>`: last 20 sales — token image (Next.js `<Image>`), token ID link to ME, price in BERA, relative timestamp, Grail badge if applicable
- [ ] `<TopSales>`: top 10 all-time, same format
- [ ] Loading skeleton states for all components
- [ ] Responsive: 1-col mobile, 2-col tablet, 4-col desktop stat cards
- [ ] `<head>` meta tags: title "MibeStats — Mibera333 Analytics", OG image

**Effort**: L (2 days)
**Dependencies**: S1-T7

---

### Task S1-T9 — `/api/stats/floor-history` Route

**Description**: Implement `GET /api/stats/floor-history` that returns daily floor price snapshots for the chart.

**Acceptance Criteria**:
- [ ] Route at `app/api/stats/floor-history/route.ts` with `revalidate = 3600`
- [ ] Query param `range`: `7d` | `30d` | `all` (default: `30d`)
- [ ] Returns: `{ date: string; floorPrice: number }[]`
- [ ] Queries `floor_price_history` table filtered by date range
- [ ] Returns empty array (not 404) if no history yet

**Effort**: S (1 hour)
**Dependencies**: S1-T2

---

### Task S1-T10 — GitHub Actions Daily Sync + Vercel Deployment

**Description**: Set up GitHub Actions workflow for daily data sync (`sync-sales.ts` + `sync-owners.ts` stubs that call the existing import scripts incrementally). Deploy to Vercel with all env vars configured.

**Acceptance Criteria**:
- [ ] `.github/workflows/daily-sync.yml`: cron `30 0 * * *` (00:30 UTC daily)
- [ ] Workflow runs `tsx scripts/sync-sales.ts` and `tsx scripts/sync-owners.ts`
- [ ] GitHub Actions secrets: `DATABASE_URL`, `ME_BEARER_TOKEN`, `BERACHAIN_RPC_URL`
- [ ] Vercel project linked to GitHub repo, auto-deploy on push to `main`
- [ ] Vercel env vars set: `DATABASE_URL`, `ME_BEARER_TOKEN`, `BERACHAIN_RPC_URL`, `NEXT_PUBLIC_CONTRACT_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID`
- [ ] Production URL accessible, Collection Overview page loads with real data
- [ ] `next build` clean in CI

**Effort**: M (half-day)
**Dependencies**: S1-T8, S1-T5, S1-T6

---

**Sprint 1 Exit Criteria**:
- [ ] MibeStats Collection Overview live at Vercel production URL
- [ ] All 10,000 tokens in PostgreSQL with `swag_score`, `swag_rank`, `rarity_rank`, `is_grail`
- [ ] Historical sales imported into `sales` table
- [ ] `owner_address` populated for all tokens
- [ ] Floor price refreshes automatically (ISR 300s)
- [ ] Daily GitHub Actions sync running

---

## Sprint 2 — Traits + Sales History

**Goal**: Rarity Explorer and Sales History pages live. Users can filter tokens by any trait combination and explore sales charts.

**Duration**: 1 week
**Global ID**: sprint-26
**Dependencies**: Sprint 1 complete

### Task S2-T1 — `/api/traits` Route

**Description**: Implement `GET /api/traits` that returns trait distribution for all 14 trait categories plus Swag Rank distribution.

**Acceptance Criteria**:
- [ ] Route at `app/api/traits/route.ts` with `revalidate = 86400`
- [ ] Returns per-category breakdown: `{ value: string; count: number; pct: number }[]`
- [ ] Categories: archetype, ancestor, element, sun_sign, drug, background, body, eyes, eyebrows, mouth, hair, hat, glasses, shirt, swag_rank
- [ ] Counts computed via `GROUP BY` SQL — single query per category (or one multi-CTE query)
- [ ] `pct` is `count / 10000 * 100` rounded to 2 decimals
- [ ] Grail count included in a `grails` field: `{ total: 42, categories: {...} }`

**Effort**: S (half-day)
**Dependencies**: Sprint 1 DB

---

### Task S2-T2 — `/api/tokens` Route (Filtered)

**Description**: Implement `GET /api/tokens` with full multi-trait filtering, sorting, and pagination.

**Acceptance Criteria**:
- [ ] Route at `app/api/tokens/route.ts` with `revalidate = 86400`
- [ ] Supported filter params: `archetype`, `ancestor`, `element`, `drug`, `hat`, `glasses`, `shirt`, `background`, `swag_rank`, `is_grail`
- [ ] Supported sort: `swag_desc` (default), `swag_asc`, `id_asc`, `price_desc` (by `last_sale_price`)
- [ ] Pagination: `page` (default 1), `limit` (default 50, max 100)
- [ ] All filters validated with Zod (unknown values return 400)
- [ ] Response: `PaginatedResponse<Token>` with `total` count for pagination UI
- [ ] `magicEdenUrl` computed field included in each token
- [ ] Query uses Prisma `where` with indexed columns — returns in < 200ms for common queries

**Effort**: M (1 day)
**Dependencies**: Sprint 1 DB, S2-T1

---

### Task S2-T3 — `/api/tokens/[id]` Route

**Description**: Implement `GET /api/tokens/[id]` for single token full detail view.

**Acceptance Criteria**:
- [ ] Route at `app/api/tokens/[id]/route.ts` with `revalidate = 3600`
- [ ] Returns full Token object (all 28+ fields)
- [ ] Includes `salesHistory`: last 50 sales for that token, ordered by `sold_at DESC`
- [ ] Returns HTTP 404 for token_id < 1 or > 10000
- [ ] Validates `id` param as integer with Zod

**Effort**: S (1 hour)
**Dependencies**: S2-T2

---

### Task S2-T4 — Traits / Rarity Explorer Page

**Description**: Build `app/traits/page.tsx` — the main rarity exploration interface. Multi-trait filter sidebar, token grid, rarity leaderboard.

**Acceptance Criteria**:
- [ ] `<TraitFilter>` sidebar: collapsible dropdowns per category, multi-select within each, active filter chips with remove button
- [ ] `<TokenGrid>`: responsive grid (2-col mobile, 3-col tablet, 5-col desktop)
  - Each card: token image (`<Image>`), token ID, `swag_rank` badge (color-coded: SSS=gold, SS=silver, S=bronze...), rarity rank `#N`, link to ME
  - Grail tokens show `<GrailBadge>` overlay
- [ ] Pagination controls (previous/next + page number input)
- [ ] `<TraitDistribution>`: horizontal bar charts (Recharts) showing distribution for selected category. Defaults to "archetype" on load.
- [ ] `<RarityLeaderboard>`: top 100 SSS + SS tokens, sorted by `rarity_rank`
- [ ] URL search params sync with active filters (sharable filtered URLs)
- [ ] Loading skeleton for grid during filter changes
- [ ] "Reset filters" button clears all active filters

**Effort**: XL (3 days)
**Dependencies**: S2-T2, S2-T1

---

### Task S2-T5 — `/api/sales` Route

**Description**: Implement `GET /api/sales` with full filtering and pagination.

**Acceptance Criteria**:
- [ ] Route at `app/api/sales/route.ts` with `revalidate = 3600`
- [ ] Filter params: `token_id`, `min_price`, `max_price`, `from_date` (ISO), `to_date` (ISO), `is_grail`
- [ ] All params Zod-validated
- [ ] Includes token data join: `token_id`, `image_url`, `swag_rank`, `is_grail`
- [ ] Default sort: `sold_at DESC`
- [ ] Pagination: default 50, max 200 per page
- [ ] Grail filter: when `is_grail=true`, JOIN with tokens and filter `is_grail = TRUE`

**Effort**: S (half-day)
**Dependencies**: Sprint 1 DB

---

### Task S2-T6 — Sales History Page

**Description**: Build `app/sales/page.tsx` with price chart, volume chart, and filterable sales table.

**Acceptance Criteria**:
- [ ] `<PriceChart>`: Recharts ScatterChart of all sales, x=date, y=price_bera. 7d/30d/all-time toggle. Grail sales highlighted with a different dot color.
- [ ] `<VolumeChart>`: Recharts BarChart, daily BERA volume. 7d/30d toggle.
- [ ] `<SalesTable>`: paginated table — columns: date, token (image + ID link), price BERA, buyer (truncated address), grail badge. Filterable by date range, min/max price, token ID.
- [ ] Charts lazy-loaded (dynamic import with `ssr: false`)
- [ ] Responsive table (horizontal scroll on mobile)

**Effort**: L (2 days)
**Dependencies**: S2-T5

---

### Task S2-T7 — `/api/grails` Route

**Description**: Implement `GET /api/grails` returning all 42 Grail tokens.

**Acceptance Criteria**:
- [ ] Route at `app/api/grails/route.ts` with `revalidate = 86400`
- [ ] Returns all tokens where `is_grail = TRUE` with full token data
- [ ] Grouped by `grail_category` in response: `{ zodiac: Token[], planet: Token[], ... }`
- [ ] 42 total tokens guaranteed in response

**Effort**: XS (30 min)
**Dependencies**: Sprint 1 DB

---

### Task S2-T8 — Navigation + Layout

**Description**: Implement the shared layout with navigation bar linking all 4 pages. MibeStats branding, mobile hamburger menu.

**Acceptance Criteria**:
- [ ] `app/layout.tsx`: global layout with `<Navbar>` and `<Footer>`
- [ ] Navbar: MibeStats logo/wordmark, links to /traits, /sales, /portfolio
- [ ] Active link highlighted (using Next.js `usePathname`)
- [ ] Mobile: hamburger menu with slide-out drawer
- [ ] Footer: contract address (with Berascan link), GitHub link, "Data from mibera-codex" attribution
- [ ] Dark mode by default (Tailwind `dark:` classes or CSS variables)

**Effort**: S (half-day)
**Dependencies**: S1-T8

---

**Sprint 2 Exit Criteria**:
- [x] Traits / Rarity Explorer live with all filter combinations working
- [x] Token grid shows swag_rank badges and grail indicators correctly
- [x] Sales History page shows price chart and volume chart with real data
- [x] URL filter params are shareable
- [x] Navigation between all 4 pages works (portfolio page is a stub)

---

## Sprint 3 — Portfolio + Security + Polish

**Goal**: Portfolio / Wallet Search live. Security hardening applied. E2E tests passing. App production-ready.

**Duration**: 1 week
**Global ID**: sprint-27
**Dependencies**: Sprint 2 complete

### Task S3-T1 — `/api/portfolio/[address]` Route

**Description**: Implement `GET /api/portfolio/[address]` that returns all Miberas held by a given wallet address, computed portfolio stats, and per-token data.

**Acceptance Criteria**:
- [ ] Route at `app/api/portfolio/[address]/route.ts` with `revalidate = 60`
- [ ] Validates address with `isAddress(addr, { strict: true })` from viem — returns HTTP 400 if invalid
- [ ] Queries `tokens WHERE owner_address = $1` — returns in < 100ms (indexed)
- [ ] Response: `{ address, tokens: Token[], stats: { count, estimatedValue, avgRarityRank, highestSwagScore, grailCount } }`
- [ ] `estimatedValue` = `count × current_floor_price` (fetched from `collection_stats`)
- [ ] Returns empty `tokens: []` (not 404) for addresses with no Miberas
- [ ] Rate limiting: 30 req/min per IP via `@vercel/ratelimit` or equivalent

**Effort**: M (1 day)
**Dependencies**: Sprint 1 DB, Sprint 2 complete

---

### Task S3-T2 — Portfolio / Wallet Search Page

**Description**: Build `app/portfolio/page.tsx` and `app/portfolio/[address]/page.tsx`. Wallet address input, holdings grid, portfolio stats.

**Acceptance Criteria**:
- [ ] `app/portfolio/page.tsx`: `<WalletSearchBar>` — text input with EIP-55 validation feedback, submit button. Redirects to `/portfolio/[address]` on submit.
- [ ] `app/portfolio/[address]/page.tsx`:
  - `<PortfolioStats>`: token count, estimated portfolio value (BERA), avg rarity rank, highest Swag Rank held, grail count
  - `<HoldingsGrid>`: same component as traits page, but pre-filtered to wallet's tokens. Same card format (image, ID, swag_rank badge, rarity rank, ME link)
  - "No Miberas found" empty state with message when wallet holds 0
  - Back link to `/portfolio`
- [ ] Address displayed truncated in header: `0x1234...abcd`
- [ ] Shareable URL: `/portfolio/0x...` works directly (no state loss on refresh)

**Effort**: L (2 days)
**Dependencies**: S3-T1

---

### Task S3-T3 — Optional Wallet Connect (RainbowKit)

**Description**: Add RainbowKit + Wagmi providers. "Connect Wallet" button in navbar auto-populates the portfolio page with the connected address.

**Acceptance Criteria**:
- [ ] `@rainbow-me/rainbowkit` and `wagmi` installed and configured
- [ ] Berachain Mainnet (chain ID 80094) added to Wagmi config
- [ ] "Connect Wallet" button in Navbar — opens RainbowKit modal
- [ ] On `/portfolio`: if wallet is connected, "View my Miberas" button links to `/portfolio/[connectedAddress]`
- [ ] Wallet state persisted in localStorage (wagmi default behavior)
- [ ] No wallet required to use any other page (purely optional)

**Effort**: M (1 day)
**Dependencies**: S3-T2

---

### Task S3-T4 — Security Hardening

**Description**: Apply all security measures from SDD §7: input validation, CSP headers, rate limiting, secret management audit.

**Acceptance Criteria**:
- [ ] Zod validation on all API route inputs (`tokens`, `sales`, `portfolio` params)
- [ ] `next.config.js` CSP headers configured (see SDD §7.3)
- [ ] Rate limiting applied: `/api/portfolio/[address]` → 30 req/min/IP; other routes → 100 req/min/IP
- [ ] Secret audit: `grep -r "ME_BEARER_TOKEN\|DATABASE_URL" src/` returns zero results (secrets only in `lib/` server-side files)
- [ ] `NEXT_PUBLIC_*` vars contain only non-sensitive values (contract address, chain ID)
- [ ] Image domains allowlist in `next.config.js` restricted to `mibera.fsn1.your-objectstorage.com`
- [ ] No `dangerouslySetInnerHTML` in any component that renders NFT metadata

**Effort**: M (1 day)
**Dependencies**: Sprint 2 complete

---

### Task S3-T5 — Unit Tests

**Description**: Write unit tests for utility functions and API route handlers using Vitest.

**Acceptance Criteria**:
- [ ] `lib/me-api.ts`: mock fetch, test retry logic (3 attempts on 429), test response parsing
- [ ] `lib/validation.ts`: test Zod schemas — valid/invalid wallet addresses, out-of-range token IDs, invalid sort params
- [ ] `scripts/import-codex.ts`: test rarity_rank computation logic with a 5-token fixture
- [ ] Rarity rank test: tokens with same swag_score receive same rank (RANK not DENSE_RANK)
- [ ] Test coverage: > 80% on `lib/` directory
- [ ] `vitest run` passes in CI

**Effort**: M (1 day)
**Dependencies**: Sprint 2 complete

---

### Task S3-T6 — E2E Tests (Playwright)

**Description**: Write E2E tests for the 4 critical user flows using Playwright.

**Acceptance Criteria**:
- [ ] **Flow 1 — Collection Overview**: Navigate to `/`, verify floor price stat card renders a number, verify chart renders
- [ ] **Flow 2 — Trait Filter**: Navigate to `/traits`, select "Milady" archetype filter, verify grid shows only Milady tokens, verify URL updates with filter param
- [ ] **Flow 3 — Sales History**: Navigate to `/sales`, verify price chart renders, verify sales table has rows
- [ ] **Flow 4 — Portfolio Lookup**: Navigate to `/portfolio`, enter a known Mibera holder address, verify holdings grid shows at least 1 token
- [ ] Tests run against production URL (using `PLAYWRIGHT_BASE_URL` env var)
- [ ] `playwright test` passes in GitHub Actions CI

**Effort**: M (1 day)
**Dependencies**: S3-T2

---

### Task S3-T7 — Performance Audit + Polish

**Description**: Run Lighthouse audit, fix any performance issues, apply final UI polish.

**Acceptance Criteria**:
- [ ] Lighthouse performance score ≥ 80 on Collection Overview (4G throttled)
- [ ] Lighthouse accessibility score ≥ 90 (WCAG 2.1 AA)
- [ ] All token images use Next.js `<Image>` with `width`, `height`, and `alt` attributes
- [ ] Charts use dynamic import with `ssr: false` to avoid hydration issues
- [ ] `loading="lazy"` on below-fold images
- [ ] Favicon + og:image set (use a Mibera token image or the Mibera logo)
- [ ] 404 page (`app/not-found.tsx`) with link back to home
- [ ] Error boundaries (`error.tsx`) on all pages

**Effort**: M (1 day)
**Dependencies**: S3-T6

---

**Sprint 3 Exit Criteria**:
- [x] Portfolio page live — any Mibera holder can look up their wallet
- [x] RainbowKit wallet connect working on Berachain Mainnet
- [x] All Zod validations active on all API routes
- [x] CSP headers and rate limiting applied
- [x] Unit tests passing (> 80% coverage on `lib/`)
- [x] E2E tests passing (4 flows)
- [ ] Lighthouse performance ≥ 80, accessibility ≥ 90 (requires deployment)
- [ ] MibeStats fully live, publicly accessible (requires Vercel deployment)

---

## Risk Assessment

| Risk | Sprint | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Magic Eden API `continuation` pagination changes | S1-T5 | Medium | Abstract pagination in `me-api.ts`; fail loudly, not silently |
| Berachain RPC getLogs slow for full Transfer event history | S1-T6 | Medium | Batch 2000 blocks/request; add 0.5s sleep; expect initial import to take 10-30 min |
| miberas.jsonl schema drift (new fields) | S1-T3 | Low | Zod `passthrough()` on extra fields; validate required fields only |
| Vercel serverless 10s timeout on trait distribution query | S2-T1 | Medium | Pre-compute distribution in daily pipeline script, store in DB; API route just reads cached result |
| RainbowKit breaking change (v2 vs v3) | S3-T3 | Low | Pin exact version; check Berachain chain support in wagmi docs before starting |

---

## Success Metrics (per PRD)

| Metric | Target | Validated In |
|--------|--------|-------------|
| FCP < 2s on 4G | 2s | S3-T7 Lighthouse |
| API p95 < 500ms | 500ms | S2-T2, S3-T1 (manual Vercel logs) |
| Floor price freshness ≤ 5 min | 5 min | S1-T7 (ISR 300s) |
| 100% of 10k tokens indexed | 10,000 | S1-T3 assertion |
| Uptime > 99% | 99% | Vercel SLA (post-launch) |

---

*Generated by /sprint-plan on 2026-02-20*
*Next step: /build — implement sprint-1 (global sprint-25)*
