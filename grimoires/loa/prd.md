# PRD: MibeStats — NFT Analytics Dashboard for Mibera333

**Version**: 1.0.0
**Status**: Draft
**Author**: Discovery Phase (plan-and-analyze)
**Cycle**: cycle-030
**Date**: 2026-02-19

---

## 1. Problem Statement

### Context

Mibera333 is a 9,999-token NFT collection on Berachain Mainnet (contract `0x6666397dfe9a8c469bf65dc744cb1c733416c420`), listed on Magic Eden and OpenSea. An existing project (`mibera-sheet-updater`) already fetches on-chain data and market stats, stores them in Google Sheets, and displays them via Looker Studio.

### Core Problems

| # | Problem | Impact |
|---|---------|--------|
| P1 | Magic Eden API rate limit of **2 req/s** forces sequential processing — 10,000 tokens take 10+ minutes per run | Stale data, brittle pipeline |
| P2 | GitHub Actions job timeout (6h) requires **10 staggered cron jobs** as a workaround for nightly updates | Complex, fragile orchestration |
| P3 | Google Sheets is the **sole data store** — no proper querying, no indexing, limited to ~10M cells | Not scalable, no analytics SQL |
| P4 | Looker Studio UI is **not interactive** — no wallet connect, no real-time updates, no custom UX | Poor user experience |
| P5 | No public-facing product — community members must use a shared Looker Studio link with no personalization | No community ownership |

### Why Now

Berachain Mainnet launched and Mibera333 has an active trading community. A dedicated analytics tool would increase community engagement and provide collectors/traders with actionable data that doesn't exist anywhere else in this form.

---

## 2. Goals & Success Metrics

### Goals

| # | Goal | Measurable Outcome |
|---|------|-------------------|
| G1 | Replace Google Sheets + Looker Studio with a dedicated web app | MibeStats live and publicly accessible |
| G2 | Solve data pipeline rate limiting with a proper cache layer | All 9,999 tokens indexed in PostgreSQL, no API timeout workarounds |
| G3 | Provide real-time collection stats (floor, volume) | Floor price refresh ≤ 5 minutes |
| G4 | Deliver interactive trait/rarity explorer | Users can filter and rank NFTs by any trait combination |
| G5 | Enable wallet-based portfolio view | Any user can paste/connect a wallet address and see their Miberas |

### Success Metrics

| Metric | Target |
|--------|--------|
| Time-to-first-meaningful-paint | < 2s on 4G |
| API p95 response time | < 500ms |
| Floor price data freshness | ≤ 5 min lag vs Magic Eden |
| Trait data freshness | Updated daily (stable data) |
| NFT trait coverage | 100% of 9,999 tokens indexed |
| Uptime | > 99% (Vercel + managed DB) |

---

## 3. User & Stakeholder Context

### Primary Personas

**The Collector**
- Owns one or more Miberas
- Wants to track their portfolio value and compare their NFTs' trait rarity
- Uses wallet connect to see their specific holdings

**The Trader**
- Actively buys/sells Miberas on Magic Eden
- Needs real-time floor price, volume trends, recent sales history
- Looks for underpriced NFTs based on trait rarity vs floor

**The Community Member**
- Doesn't necessarily own Miberas but is active in the ecosystem
- Curious about collection statistics, biggest sales, trait distribution
- Uses MibeStats as a reference when discussing the collection

### Stakeholder

- **@janitooor** (primary maintainer) — builds and owns MibeStats
- **Mibera333 community** — primary users, no login required

---

## 4. Functional Requirements

### 4.1 Page: Collection Overview

| ID | Requirement | Priority |
|----|-------------|----------|
| F1.1 | Display current floor price (refreshed ≤ 5 min from Magic Eden API) | MUST |
| F1.2 | Display volume metrics: 24h, 7d, 30d, all-time | MUST |
| F1.3 | Display total sales count and total unique holders | MUST |
| F1.4 | Display a chart of floor price over time (7d, 30d, all-time) | MUST |
| F1.5 | Display most recent sales feed (last 10–20 sales with price, token, date) | SHOULD |
| F1.6 | Display top sales of all time (by price) | SHOULD |

### 4.2 Page: Traits / Rarity Explorer

| ID | Requirement | Priority |
|----|-------------|----------|
| F2.1 | Display all trait categories and their value distribution (count + % of supply) | MUST |
| F2.2 | Compute and display a rarity score per token (e.g., statistical rarity based on trait frequency) | MUST |
| F2.3 | Allow filtering the collection by one or more trait values (combinable filters) | MUST |
| F2.4 | Display filtered results as a grid with token image, ID, rarity rank, and floor price | MUST |
| F2.5 | Link each token to its Magic Eden listing page | SHOULD |
| F2.6 | Display a rarity leaderboard (top 100 rarest tokens) | SHOULD |

### 4.3 Page: Sales History & Charts

| ID | Requirement | Priority |
|----|-------------|----------|
| F3.1 | Display a price chart (line/area) of all sales over time | MUST |
| F3.2 | Display daily/weekly volume bar chart | MUST |
| F3.3 | Filterable sales table: date range, min/max price, token ID | SHOULD |
| F3.4 | Highlight "grail" traits in the sales feed (visual indicator) | COULD |

### 4.4 Page: Portfolio / Wallet Search

| ID | Requirement | Priority |
|----|-------------|----------|
| F4.1 | Accept a wallet address (paste or typed) without requiring wallet connection | MUST |
| F4.2 | Display all Miberas held by that address with image, ID, and rarity rank | MUST |
| F4.3 | Display estimated portfolio value (count × floor price) | MUST |
| F4.4 | Optional wallet connect (Rainbow Kit / Wagmi) for auto-populating the address | SHOULD |
| F4.5 | Display per-token estimated value, last sale price, and highest sale price | SHOULD |

---

## 5. Technical & Non-Functional Requirements

### 5.1 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14+ (App Router) + TypeScript | SSR for SEO, API routes, excellent Web3 ecosystem |
| Styling | Tailwind CSS | Rapid UI development, consistent design |
| Charts | Recharts or Chart.js | Lightweight, well-supported in Next.js |
| Wallet Connect | Rainbow Kit + Wagmi + Viem | Standard Web3 stack, Berachain EVM-compatible |
| Backend | Next.js API Routes | Unified codebase, Vercel-native |
| Database | PostgreSQL via Supabase or Neon | Managed, free tier sufficient, proper SQL for analytics |
| ORM | Prisma | Type-safe queries, auto-generated types |
| Hosting | Vercel | GitHub integration, free tier, global CDN |
| Data pipeline | Node.js or Python scripts (cron via Vercel Cron or GitHub Actions) | Replaces existing staggered cron workaround |

### 5.2 Data Sources & Strategy

| Data Type | Source | Refresh Strategy | Storage |
|-----------|--------|-----------------|---------|
| Floor price, volume, total sales | Magic Eden API | Polling every 5 min (single request, no rate limit pressure) | PostgreSQL `collection_stats` table |
| Recent sales (last 500) | Magic Eden API | Hourly batch fetch, paginated | PostgreSQL `sales` table |
| Historical sales (all-time) | Magic Eden API | One-time bulk import, then incremental | PostgreSQL `sales` table |
| Token metadata & traits | Berachain RPC → IPFS | One-time full indexing, then daily delta | PostgreSQL `tokens` table |
| Token images | IPFS gateway (stored as URLs, not base64) | One-time indexing, CDN-cached | PostgreSQL `tokens.image_url` |
| Wallet holdings | Berachain RPC (`ownerOf` / `tokensOfOwner`) | On-demand (per wallet request) | Not stored (real-time query) |

### 5.3 Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | First Contentful Paint < 1.5s; API responses < 500ms p95 |
| **Availability** | > 99% uptime (Vercel SLA + managed DB) |
| **Security** | No private keys in codebase; API secrets in Vercel env vars; input validation on wallet addresses (EIP-55 checksum); rate-limit public API routes |
| **Accessibility** | WCAG 2.1 AA — semantic HTML, keyboard navigation, sufficient color contrast |
| **Responsiveness** | Mobile-first, tested on 375px, 768px, 1280px+ viewports |
| **SEO** | Next.js SSR/SSG for collection and trait pages; meta tags for social sharing |
| **Cost** | Target $0/month on free tiers (Vercel Hobby + Supabase/Neon free) for initial launch |

---

## 6. Scope & Prioritization

### MVP (Sprint 1–2)

- Data pipeline: PostgreSQL schema + full initial indexing (traits, images) + ME sales import
- Collection Overview page: floor, volume, sales count, price chart
- Traits / Rarity Explorer: distribution, rarity scores, filter + grid
- Deployment: Vercel + Supabase, GitHub Actions for daily cron

### Phase 2 (Sprint 3)

- Sales History page: price chart, volume chart, sales table
- Portfolio / Wallet Search: address lookup, holdings display, portfolio value

### Phase 3 (Future)

- Wallet connect (Rainbow Kit) — optional wallet auth
- Notifications / alerts (floor drop, whale buy)
- "Grail" rarity tier display
- Comparison tool (my Miberas vs floor rarity)
- Multi-language support

### Out of Scope (v1.0)

- Buying/selling NFTs (no marketplace functionality)
- User accounts / login system
- Push notifications
- Mobile app
- Multi-collection support (Mibera333 only at launch)

---

## 7. Risks & Dependencies

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Magic Eden API deprecates or changes endpoints | Medium | High | Abstract API calls behind a service layer; monitor ME developer docs |
| Berachain RPC rate limits during initial indexing | Medium | Medium | Batch RPC calls with delays; use multiple public RPC endpoints as fallback |
| IPFS gateway unavailability for image fetching | Low | Medium | Store image URLs (not base64); use multiple IPFS gateways with fallback |
| Supabase/Neon free tier limits exceeded | Low | Medium | Monitor usage; upgrade to paid tier if needed (~$10/month) |
| Vercel Hobby plan function timeout (10s) for heavy queries | Medium | Medium | Pre-aggregate heavy analytics on the data pipeline side, not at request time |

### Security Risks

| Risk | Mitigation |
|------|-----------|
| XSS through NFT metadata (malicious trait values) | Sanitize all user-generated / on-chain content before rendering |
| Wallet address injection via query params | Validate EIP-55 checksum before any DB/RPC query |
| API key exposure | Vercel env vars only; never in client-side code |
| DDoS on public API routes | Vercel rate limiting + caching headers |

### External Dependencies

| Dependency | Risk Level | Notes |
|-----------|-----------|-------|
| Magic Eden API | Medium | Bearer token required; no SLA guarantee |
| Berachain RPC (`rpc.berachain.com`) | Low | Public endpoint; can switch to Ankr/Alchemy Berachain |
| IPFS (ipfs.io gateway) | Medium | Public gateway; no SLA |
| Vercel (hosting) | Low | Established platform; 99.99% SLA on Pro |
| Supabase / Neon (database) | Low | Managed PostgreSQL; free tier for MVP |

---

## 8. Source Tracing

| Requirement Area | Source |
|-----------------|--------|
| Data sources (ME API, Berachain RPC, IPFS) | Derived from `mibera-sheet-updater` codebase analysis |
| Rate limiting problems | `magiceden_update.py` + `cron_update_from_contract.yml` in existing repo |
| Contract address + token range | Hardcoded in existing scripts: `0x6666...420`, IDs 1–9999 |
| Pages (collection, traits, sales, portfolio) | Discovery Phase interview — user selection |
| Stack (Next.js, PostgreSQL, Vercel) | Discovery Phase interview — user selection |
| Data freshness strategy | Discovery Phase interview — "mix: floor real-time, traits daily" |
| Wallet connect optional | Discovery Phase interview |
| Archetype context | `grimoires/loa/context/archetype.md` |

---

*Generated by /plan-and-analyze on 2026-02-19*
*Next step: /architect — Software Design Document*
