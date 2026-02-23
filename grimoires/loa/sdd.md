# SDD: MibeStats — NFT Analytics Dashboard for Mibera333

**Version**: 1.0.0
**Status**: Draft
**Author**: Architect Phase
**Cycle**: cycle-030
**PRD**: grimoires/loa/prd.md (v1.0.0)
**Date**: 2026-02-20

---

## 1. Executive Summary

MibeStats is a public-facing full-stack web application providing analytics and exploration tools for the Mibera333 NFT collection on Berachain. It replaces the current Google Sheets + Looker Studio pipeline with a proper PostgreSQL database, Next.js frontend, and a simplified data pipeline.

**Critical architectural insight**: The `mibera-codex` GitHub repository (`0xHoneyJar/mibera-codex`) is the canonical source of truth for all static NFT data — traits, Swag Scores, Grails, and images. This eliminates the primary bottleneck of the existing system (IPFS sequential fetching at 2 req/s). The new pipeline imports from the codex's `miberas.jsonl` (6.4 MB, one-time) and only uses the Magic Eden API for market data.

---

## 2. System Architecture

### 2.1 High-Level Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VERCEL (Hosting)                              │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     Next.js 14 App                           │    │
│  │                                                               │    │
│  │  PAGES (App Router)                                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │    │
│  │  │   /      │  │ /traits  │  │  /sales  │  │ /portfolio │  │    │
│  │  │Collection│  │ Rarity   │  │ History  │  │ /[address] │  │    │
│  │  │Overview  │  │ Explorer │  │ & Charts │  │            │  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │    │
│  │                                                               │    │
│  │  API ROUTES (Route Handlers)                                 │    │
│  │  ┌──────────────────────────────────────────────────────┐   │    │
│  │  │ /api/collection   /api/tokens   /api/sales           │   │    │
│  │  │ /api/portfolio    /api/traits   /api/grails          │   │    │
│  │  │ /api/stats/floor-history                             │   │    │
│  │  └──────────────────────┬───────────────────────────────┘   │    │
│  └─────────────────────────┼─────────────────────────────────── ┘   │
│                             │                                         │
│  ┌──────────────────────────▼────────────────────────────────────┐  │
│  │               Data Layer — Prisma + PostgreSQL                  │  │
│  │                                                                 │  │
│  │  tokens | sales | collection_stats | floor_price_history       │  │
│  └─────────────────────────────────────────────────────────────── ┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                GITHUB ACTIONS (Data Pipeline)                        │
│                                                                       │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐    │
│  │ import-codex │   │  sync-sales      │   │  sync-owners     │    │
│  │ (one-time)   │   │  (daily cron)    │   │  (daily cron)    │    │
│  └──────────────┘   └──────────────────┘   └──────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

EXTERNAL SOURCES
┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────┐
│  mibera-codex    │  │  Magic Eden API  │  │  Berachain RPC      │
│  miberas.jsonl   │  │  collection stats│  │  Transfer events    │
│  grails.jsonl    │  │  sales history   │  │  (80094 mainnet)    │
└──────────────────┘  └──────────────────┘  └─────────────────────┘
```

### 2.2 Data Flow

```
BOOTSTRAP (one-time):
mibera-codex/miberas.jsonl → import-codex.ts → PostgreSQL tokens table (10,000 rows)
mibera-codex/grails.jsonl  → import-codex.ts → tokens.is_grail = true (42 tokens)
Magic Eden API (paginated)  → import-sales.ts → PostgreSQL sales table (full history)
Berachain RPC (getLogs)     → build-owners.ts → tokens.owner_address (10,000 rows)

DAILY MAINTENANCE (GitHub Actions cron 00:30 UTC):
Magic Eden API → sync-sales.ts  → INSERT new sales since last_synced_at
Berachain RPC  → sync-owners.ts → UPDATE tokens.owner_address from new Transfer events

REAL-TIME (on API request, ISR):
Magic Eden API → /api/collection → PostgreSQL collection_stats UPDATE → response
(cache: 5 min via Next.js revalidation)
```

---

## 3. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Runtime | Node.js | 20 LTS | Vercel native, async RPC calls |
| Framework | Next.js | 14 (App Router) | SSR/ISR, API routes, Vercel-native |
| Language | TypeScript | 5.x | Type safety across frontend + backend |
| Styling | Tailwind CSS | 3.x | Rapid UI, zero runtime CSS |
| Charts | Recharts | 2.x | React-native, composable, SSR-compatible |
| Web3 | Viem | 2.x | Lightweight, typed Berachain calls |
| Wallet | RainbowKit + Wagmi | Latest | Standard Web3 stack, EVM-compatible |
| ORM | Prisma | 5.x | Type-safe queries, auto-generated TS types |
| Database | PostgreSQL 15 | via Supabase | Managed, 500 MB free tier, admin UI |
| Hosting | Vercel | Hobby | Free tier, GitHub CI/CD, CDN |
| Pipeline | GitHub Actions | ubuntu-22.04 | Free cron jobs, existing familiarity |
| HTTP client | Native fetch | Node 20+ | No extra dependency |

---

## 4. Component Design

### 4.1 Frontend Pages

#### `/` — Collection Overview
- **Rendering**: ISR, `revalidate = 300` (5 min)
- **Data**: `/api/collection` (floor, volumes, holders, recent sales)
- **Components**:
  - `<StatCard>` — floor price, 24h/7d/30d/all-time volume, total sales, unique holders
  - `<FloorPriceChart>` — Recharts AreaChart, time range selector (7d / 30d / all-time)
  - `<RecentSalesFeed>` — last 20 sales with token image, ID, price, date, ME link
  - `<TopSales>` — all-time top 10 sales by price

#### `/traits` — Rarity Explorer
- **Rendering**: ISR, `revalidate = 86400` (1 day — traits are static)
- **Data**: `/api/traits` (distribution), `/api/tokens` (filtered grid)
- **Components**:
  - `<TraitFilter>` — multi-select dropdowns per category (archetype, ancestor, drug, hat, etc.)
  - `<TraitDistribution>` — horizontal bar chart per trait category
  - `<TokenGrid>` — paginated grid: image, ID, Swag Rank badge, rarity rank
  - `<RarityLeaderboard>` — top 100 SSS + SS tokens
  - `<GrailBadge>` — visual indicator on grail tokens

#### `/sales` — Sales History
- **Rendering**: ISR, `revalidate = 3600` (1 hour)
- **Data**: `/api/sales`, `/api/stats/floor-history`
- **Components**:
  - `<PriceChart>` — Recharts LineChart, all sales scatter + moving average
  - `<VolumeChart>` — Recharts BarChart, daily/weekly volume
  - `<SalesTable>` — filterable table (date range, min/max price, token ID, grail flag)

#### `/portfolio/[address]` — Wallet Portfolio
- **Rendering**: Server component, `revalidate = 60` (1 min cache)
- **Data**: `/api/portfolio/[address]`
- **Components**:
  - `<WalletSearchBar>` — address input with EIP-55 validation + RainbowKit connect button
  - `<PortfolioStats>` — token count, estimated value (count × floor), avg rarity rank
  - `<HoldingsGrid>` — same grid as traits page but filtered to wallet's tokens
  - `<TokenDetail>` — per-token stats: last sale, max sale, rarity rank, ME link

### 4.2 API Routes

| Route | Cache | Description |
|-------|-------|-------------|
| `GET /api/collection` | 300s ISR | Floor, volumes, holders, recent sales |
| `GET /api/tokens` | 86400s ISR | Paginated + filtered tokens |
| `GET /api/tokens/[id]` | 3600s ISR | Single token full detail + sale history |
| `GET /api/sales` | 3600s ISR | Paginated sales, filterable |
| `GET /api/portfolio/[address]` | 60s | Tokens held by address |
| `GET /api/traits` | 86400s ISR | Trait distribution counts |
| `GET /api/grails` | 86400s ISR | All 42 grail records |
| `GET /api/stats/floor-history` | 3600s ISR | Daily floor snapshots for chart |

### 4.3 Data Pipeline Scripts

Located at `scripts/` (TypeScript, run via `tsx`):

| Script | Trigger | Action |
|--------|---------|--------|
| `import-codex.ts` | Manual (one-time) | Fetch `miberas.jsonl` + `grails.jsonl` from codex, insert 10k tokens |
| `import-sales.ts` | Manual (one-time) | Bulk import all historical ME sales (paginated, rate-limited) |
| `build-owners.ts` | Manual (one-time) | Query all Transfer events from Berachain RPC, update `owner_address` |
| `sync-sales.ts` | Daily cron 00:30 UTC | Fetch new ME sales since `last_synced_at`, INSERT |
| `sync-owners.ts` | Daily cron 00:30 UTC | Fetch new Transfer events since last block, UPDATE `owner_address` |

---

## 5. Data Architecture

### 5.1 Database Schema

```sql
-- Core NFT data (10,000 rows, populated from mibera-codex)
CREATE TABLE tokens (
  id                SERIAL PRIMARY KEY,
  token_id          INTEGER UNIQUE NOT NULL,       -- 1–10000

  -- Identity (from codex)
  archetype         TEXT NOT NULL,                 -- Freetekno | Milady | Acidhouse | Chicago/Detroit
  ancestor          TEXT NOT NULL,                 -- 33 cultural lineages
  time_period       TEXT NOT NULL,                 -- Modern | Ancient
  birthday          TEXT,
  birth_coordinates TEXT,

  -- Astrology (from codex)
  sun_sign          TEXT,
  moon_sign         TEXT,
  ascending_sign    TEXT,
  element           TEXT,                           -- Air | Earth | Fire | Water

  -- Rarity (from codex — no recomputation needed)
  swag_score        INTEGER NOT NULL,               -- 0–100
  swag_rank         TEXT NOT NULL,                  -- SSS | SS | S | A | B | C | D | F
  rarity_rank       INTEGER,                        -- 1–10000 rank by swag_score DESC

  -- Visual traits (from codex)
  background        TEXT,
  body              TEXT,
  eyes              TEXT,
  eyebrows          TEXT,
  mouth             TEXT,
  hair              TEXT,
  shirt             TEXT,
  hat               TEXT,
  glasses           TEXT,
  mask              TEXT,
  earrings          TEXT,
  face_accessory    TEXT,
  tattoo            TEXT,
  item              TEXT,
  drug              TEXT,                           -- 78 substances (maps to tarot)

  -- Grail flag (from grails.jsonl)
  is_grail          BOOLEAN NOT NULL DEFAULT FALSE,
  grail_name        TEXT,
  grail_category    TEXT,                           -- Zodiac | Planet | Ancestor | etc.

  -- Market data (from ME API, updated daily)
  owner_address     TEXT,                           -- updated by sync-owners.ts
  last_sale_price   DECIMAL(18,8),
  last_sale_date    TIMESTAMPTZ,
  max_sale_price    DECIMAL(18,8),
  max_sale_date     TIMESTAMPTZ,
  sale_count        INTEGER NOT NULL DEFAULT 0,

  -- Image (from codex trait files — object storage URL)
  image_url         TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_tokens_archetype     ON tokens(archetype);
CREATE INDEX idx_tokens_swag_score    ON tokens(swag_score DESC);
CREATE INDEX idx_tokens_rarity_rank   ON tokens(rarity_rank);
CREATE INDEX idx_tokens_owner         ON tokens(owner_address);
CREATE INDEX idx_tokens_is_grail      ON tokens(is_grail) WHERE is_grail = TRUE;
CREATE INDEX idx_tokens_drug          ON tokens(drug);
CREATE INDEX idx_tokens_ancestor      ON tokens(ancestor);

-- GIN index for multi-trait filtering
CREATE INDEX idx_tokens_traits_gin ON tokens USING GIN (
  to_tsvector('simple',
    coalesce(archetype,'') || ' ' ||
    coalesce(ancestor,'') || ' ' ||
    coalesce(drug,'') || ' ' ||
    coalesce(hat,'') || ' ' ||
    coalesce(background,'')
  )
);

-- Sales history (grows over time)
CREATE TABLE sales (
  id               BIGSERIAL PRIMARY KEY,
  token_id         INTEGER NOT NULL REFERENCES tokens(token_id),
  price_bera       DECIMAL(18,8) NOT NULL,
  price_usd        DECIMAL(18,2),                  -- nullable, enriched if BERA/USD available
  sold_at          TIMESTAMPTZ NOT NULL,
  buyer_address    TEXT,
  seller_address   TEXT,
  tx_hash          TEXT UNIQUE,                    -- dedup guard
  marketplace      TEXT NOT NULL DEFAULT 'magic_eden',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_token_id ON sales(token_id);
CREATE INDEX idx_sales_sold_at  ON sales(sold_at DESC);
CREATE INDEX idx_sales_price    ON sales(price_bera DESC);

-- Collection stats (single row, updated ~5 min via ISR)
CREATE TABLE collection_stats (
  id              INTEGER PRIMARY KEY DEFAULT 1,   -- always row 1
  floor_price     DECIMAL(18,8),
  volume_24h      DECIMAL(18,8),
  volume_7d       DECIMAL(18,8),
  volume_30d      DECIMAL(18,8),
  volume_all_time DECIMAL(18,8),
  total_sales     INTEGER,
  total_holders   INTEGER,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (id = 1)                                   -- enforce singleton
);

-- Daily floor price snapshots (for historical charts)
CREATE TABLE floor_price_history (
  id          BIGSERIAL PRIMARY KEY,
  floor_price DECIMAL(18,8) NOT NULL,
  recorded_at DATE NOT NULL UNIQUE                 -- one row per day
);

-- Pipeline sync state (tracks last synced position)
CREATE TABLE sync_state (
  key         TEXT PRIMARY KEY,                    -- 'sales_last_synced' | 'owners_last_block'
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5.2 Data Sources Mapping

| Table | Primary Source | Update Frequency |
|-------|---------------|-----------------|
| `tokens` (static fields) | `mibera-codex/miberas.jsonl` | One-time import |
| `tokens.is_grail` | `mibera-codex/grails.jsonl` | One-time import |
| `tokens.owner_address` | Berachain RPC Transfer events | Daily |
| `tokens` (sale fields) | Magic Eden API | Daily (via sales join) |
| `sales` | Magic Eden API | Daily incremental |
| `collection_stats` | Magic Eden API | ~5 min (ISR on-demand) |
| `floor_price_history` | Magic Eden API | Daily |

### 5.3 Rarity Calculation

**No custom algorithm needed.** The `mibera-codex` already provides:
- `swag_score` (0–100) — project-canonical rarity score
- `swag_rank` (SSS > SS > S > A > B > C > D > F) — 8-tier rarity rank

At import time, `rarity_rank` (1–10000) is computed once:
```sql
UPDATE tokens t
SET rarity_rank = r.rank
FROM (
  SELECT token_id, RANK() OVER (ORDER BY swag_score DESC) as rank
  FROM tokens
) r
WHERE t.token_id = r.token_id;
```

Tokens with identical `swag_score` receive the same rank (tied). Grails are flagged but not given special rank treatment — their swag_score determines rank like any other token.

---

## 6. API Design

### 6.1 Response Types (TypeScript)

```typescript
// Core types (generated by Prisma, extended manually)

type SwagRank = 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

interface Token {
  tokenId: number;
  archetype: string;
  ancestor: string;
  element: string;
  sunSign: string;
  moonSign: string;
  ascendingSign: string;
  swagScore: number;
  swagRank: SwagRank;
  rarityRank: number;
  background: string | null;
  body: string | null;
  eyes: string | null;
  eyebrows: string | null;
  mouth: string | null;
  hair: string | null;
  shirt: string | null;
  hat: string | null;
  glasses: string | null;
  mask: string | null;
  earrings: string | null;
  faceAccessory: string | null;
  tattoo: string | null;
  item: string | null;
  drug: string | null;
  isGrail: boolean;
  grailName: string | null;
  grailCategory: string | null;
  imageUrl: string | null;
  lastSalePrice: number | null;
  maxSalePrice: number | null;
  saleCount: number;
  ownerAddress: string | null;
  magicEdenUrl: string;   // computed: `https://magiceden.io/item-details/berachain/${contractAddress}/${tokenId}`
}

interface CollectionStats {
  floorPrice: number | null;
  volume24h: number | null;
  volume7d: number | null;
  volume30d: number | null;
  volumeAllTime: number | null;
  totalSales: number | null;
  totalHolders: number | null;
  updatedAt: string;
}

interface Sale {
  id: number;
  tokenId: number;
  priceBera: number;
  priceUsd: number | null;
  soldAt: string;
  buyerAddress: string | null;
  sellerAddress: string | null;
  marketplace: string;
  token?: Pick<Token, 'tokenId' | 'imageUrl' | 'swagRank' | 'isGrail'>;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
```

### 6.2 Endpoint Contracts

#### `GET /api/collection`
```
Response: CollectionStats & {
  recentSales: Sale[];    // last 20
  topSales: Sale[];       // all-time top 10 by price
}
Cache: revalidate=300 (5 min ISR)
```

#### `GET /api/tokens`
```
Query params:
  archetype?: string
  ancestor?: string
  element?: string
  drug?: string
  hat?: string
  glasses?: string
  shirt?: string
  background?: string
  swag_rank?: SwagRank
  is_grail?: boolean
  sort?: 'swag_desc' | 'swag_asc' | 'id_asc' | 'price_desc'
  page?: number (default: 1)
  limit?: number (default: 50, max: 100)

Response: PaginatedResponse<Token>
Cache: revalidate=86400 (static data)
```

#### `GET /api/tokens/[id]`
```
Response: Token & { salesHistory: Sale[] }
Cache: revalidate=3600
Errors: 404 if token_id < 1 or > 10000
```

#### `GET /api/sales`
```
Query params:
  token_id?: number
  min_price?: number
  max_price?: number
  from_date?: string (ISO)
  to_date?: string (ISO)
  is_grail?: boolean
  page?: number
  limit?: number (default: 50, max: 200)

Response: PaginatedResponse<Sale>
Cache: revalidate=3600
```

#### `GET /api/portfolio/[address]`
```
Path param: address — validated as checksummed EIP-55 address
Response: {
  address: string;
  tokens: Token[];
  stats: {
    count: number;
    estimatedValue: number | null;  // count × floor_price
    avgRarityRank: number;
    highestSwagScore: number;
    grailCount: number;
  }
}
Cache: revalidate=60
Errors: 400 if invalid address
```

#### `GET /api/traits`
```
Response: {
  archetypes:    { value: string; count: number; pct: number }[];
  ancestors:     { value: string; count: number; pct: number }[];
  elements:      { value: string; count: number; pct: number }[];
  drugs:         { value: string; count: number; pct: number }[];
  backgrounds:   { value: string; count: number; pct: number }[];
  hats:          { value: string; count: number; pct: number }[];
  swagRanks:     { rank: SwagRank; count: number; pct: number }[];
  // ... all 14 trait categories
}
Cache: revalidate=86400
```

#### `GET /api/stats/floor-history`
```
Query: range?: '7d' | '30d' | 'all' (default: '30d')
Response: { date: string; floorPrice: number }[]
Cache: revalidate=3600
```

---

## 7. Security Architecture

### 7.1 Input Validation

All API routes validate inputs with Zod:

```typescript
// Wallet address validation
const addressSchema = z.string().refine(
  (addr) => isAddress(addr, { strict: true }),  // viem EIP-55 checksum
  { message: 'Invalid EIP-55 checksummed address' }
);

// Token filter validation
const tokenQuerySchema = z.object({
  archetype: z.string().max(50).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  // ...
});
```

### 7.2 Secrets Management

| Secret | Location | Never In |
|--------|----------|---------|
| `ME_BEARER_TOKEN` | Vercel env vars + GitHub Actions secrets | Client bundle |
| `DATABASE_URL` | Vercel env vars + GitHub Actions secrets | Client bundle |
| `BERACHAIN_RPC_URL` | Vercel env vars + GitHub Actions secrets | Client bundle |

Client-side code never imports from `process.env.*` for secrets. All ME API calls and RPC calls go through server-side API routes.

### 7.3 XSS Prevention

- All NFT data (trait names, drug names, ancestor names) rendered as React text nodes — never `dangerouslySetInnerHTML`
- Image URLs validated to match expected object storage domain before rendering in `<Image>`
- Next.js Content Security Policy headers via `next.config.js`:
```javascript
const cspHeader = `
  default-src 'self';
  img-src 'self' https://mibera.fsn1.your-objectstorage.com data:;
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  connect-src 'self' https://*.supabase.co;
`;
```

### 7.4 Rate Limiting

Public API routes protected via `@vercel/ratelimit` (or `upstash/ratelimit`):
- `/api/portfolio/[address]`: 30 req/min per IP (prevents wallet enumeration)
- Other routes: 100 req/min per IP (prevents scraping)

### 7.5 CSRF

No CSRF risk — MibeStats is a read-only API (no state mutations from the browser). POST routes do not exist in v1.0.

---

## 8. Integration Points

### 8.1 Magic Eden API

```
Base URL: https://api-mainnet.magiceden.dev/v3
Auth: Authorization: Bearer ${ME_BEARER_TOKEN}

Endpoints used:
  GET /rtp/berachain/collections/v7?id=mibera333
    → floor_price, volume, total_sales, total_holders

  GET /rtp/berachain/sales/v6?collection=mibera333&limit=100&continuation=...
    → paginated sales: price, tokenId, buyer, seller, timestamp
```

**Rate limit strategy**: Single collection-level request for stats (no per-token calls). Sales sync is paginated with 0.6s delay between pages — total volume is manageable daily.

### 8.2 mibera-codex GitHub

```
Data files (raw GitHub CDN, public, no auth):
  https://raw.githubusercontent.com/0xHoneyJar/mibera-codex/main/_codex/data/miberas.jsonl
  https://raw.githubusercontent.com/0xHoneyJar/mibera-codex/main/_codex/data/grails.jsonl
  https://raw.githubusercontent.com/0xHoneyJar/mibera-codex/main/_codex/data/contracts.json
```

One-time import only. No runtime dependency on GitHub CDN.

### 8.3 Berachain RPC

```
Network: Berachain Mainnet, Chain ID: 80094
Public RPC: https://rpc.berachain.com
Fallback: Ankr / Alchemy Berachain endpoint

Calls used:
  eth_getLogs  — Transfer events for owner indexing
    filter: address=0x6666397DFe9a8c469BF65dc744CB1C733416c420
            topics=[Transfer event sig]
  eth_blockNumber — get latest block for sync_state
```

Wallet portfolio queries use the pre-indexed `owner_address` column — no live RPC call at request time.

### 8.4 Supabase

```
Connection: DATABASE_URL (pooled via PgBouncer, Supabase built-in)
Client: Prisma 5 (not Supabase JS client — keeps ORM as single data layer)
```

---

## 9. Scalability & Performance

### 9.1 ISR Cache Strategy

| Route | Revalidation | Reasoning |
|-------|-------------|-----------|
| `/` | 300s | Floor price freshness ≤ 5 min |
| `/traits` | 86400s | Trait data is static |
| `/sales` | 3600s | New sales hourly |
| `/portfolio/[address]` | 60s | Short cache, ownership changes daily |
| API `/api/collection` | 300s | Same as page |
| API `/api/tokens` | 86400s | Static |

### 9.2 Database Performance

- `tokens` table: 10,000 rows — fits entirely in PostgreSQL shared_buffers cache. All filtered queries return in < 5ms.
- `sales` table: will grow to ~50k+ rows over time. Indexed on `sold_at DESC` and `token_id`. All chart queries are time-range aggregates.
- Heavy analytics queries (trait distributions, leaderboards) are pre-computed nightly and cached in the response, not computed at request time.

### 9.3 Heavy Query Handling

Vercel Hobby serverless functions have a 10s timeout. Mitigation:
- Pre-aggregate trait distributions at pipeline time (store counts in a materialized view or JSON blob in `collection_stats`)
- Paginate all token queries (50 per page max)
- The `/api/traits` response is precomputed nightly and cached for 24h

---

## 10. Deployment Architecture

### 10.1 Environments

| Env | Branch | URL | DB |
|-----|--------|-----|----|
| Production | `main` | `mibestats.xyz` (or Vercel default) | Supabase prod project |
| Preview | PR branches | Vercel preview URL | Supabase prod (read-only) |
| Local dev | feature/* | `localhost:3000` | Supabase local / dev project |

### 10.2 CI/CD Pipeline

```
Developer pushes to main
  └── Vercel auto-deploys (< 2 min)
        ├── next build (type check + lint)
        └── Deploy to CDN

GitHub Actions (on push to main):
  └── Type check: tsc --noEmit
  └── Lint: eslint src/

GitHub Actions (daily cron 00:30 UTC):
  └── sync-sales.ts   → DB
  └── sync-owners.ts  → DB
  └── Record floor snapshot → DB
```

### 10.3 Environment Variables

```bash
# Vercel (server-side only)
DATABASE_URL=postgresql://...supabase.co:5432/postgres?pgbouncer=true
ME_BEARER_TOKEN=...
BERACHAIN_RPC_URL=https://rpc.berachain.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x6666397DFe9a8c469BF65dc744CB1C733416c420
NEXT_PUBLIC_CHAIN_ID=80094

# GitHub Actions (pipeline scripts)
DATABASE_URL=...
ME_BEARER_TOKEN=...
BERACHAIN_RPC_URL=...
```

`NEXT_PUBLIC_*` vars are safe to expose to the browser (non-secret contract metadata).

---

## 11. Development Workflow

### 11.1 Repository Structure

```
mibestats/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Collection Overview
│   ├── traits/page.tsx           # Rarity Explorer
│   ├── sales/page.tsx            # Sales History
│   ├── portfolio/[address]/page.tsx
│   └── api/
│       ├── collection/route.ts
│       ├── tokens/route.ts
│       ├── tokens/[id]/route.ts
│       ├── sales/route.ts
│       ├── portfolio/[address]/route.ts
│       ├── traits/route.ts
│       └── stats/floor-history/route.ts
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── charts/                   # Recharts wrappers
│   ├── token/                    # TokenCard, TokenGrid, TokenDetail
│   ├── collection/               # StatCard, RecentSales, TopSales
│   └── portfolio/                # WalletSearch, HoldingsGrid
├── lib/
│   ├── db.ts                     # Prisma client singleton
│   ├── me-api.ts                 # Magic Eden API wrapper
│   ├── rpc.ts                    # Viem + Berachain client
│   └── validation.ts             # Zod schemas
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── scripts/                      # Data pipeline (tsx)
│   ├── import-codex.ts
│   ├── import-sales.ts
│   ├── build-owners.ts
│   ├── sync-sales.ts
│   └── sync-owners.ts
├── types/
│   └── index.ts                  # Shared TypeScript types
├── .github/workflows/
│   ├── daily-sync.yml            # 00:30 UTC daily
│   └── ci.yml                    # Type check + lint on PR
└── next.config.js
```

### 11.2 Git Strategy

- `main` — production branch, protected. PRs required.
- `feature/*` — feature branches, short-lived
- PRs require: passing CI (tsc + eslint) + manual review

### 11.3 Testing Strategy

| Layer | Tool | Coverage |
|-------|------|---------|
| Unit | Vitest | Utility functions (rarity rank, address validation, ME response parsing) |
| Integration | Vitest + mock DB | API route handlers with mocked Prisma client |
| E2E | Playwright | Critical paths: collection page load, trait filter, portfolio address lookup |

---

## 12. Technical Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Magic Eden API changes endpoints | Medium | High | Abstract all ME calls behind `lib/me-api.ts`; version endpoint in env var |
| mibera-codex `miberas.jsonl` schema changes | Low | Medium | Validate schema at import time with Zod; fail loudly, never silently corrupt |
| Berachain RPC rate limit during Transfer event indexing | Medium | Medium | Batch `getLogs` by block range (5000 blocks/request); sleep between batches |
| Vercel 10s function timeout on heavy queries | Medium | Medium | Pre-aggregate all analytics in pipeline; paginate everything; never full-table scan at request time |
| Supabase free tier (500 MB) exceeded | Low | Low | ~10k tokens × 28 fields ≈ 5 MB. Sales: ~50k rows ≈ 5 MB. Total well within free tier. |
| IPFS image gateway down | N/A | N/A | **Mitigated by design**: Images are served from `mibera.fsn1.your-objectstorage.com` (object storage), not IPFS |

---

## 13. Future Considerations

- **Realtime floor price via Supabase Realtime**: Replace ISR polling with WebSocket subscription when a pipeline writes to `collection_stats`
- **Wallet notifications**: Supabase Edge Functions + webhooks for floor drops
- **MiberaSets / Candies**: Extend to track other ecosystem contracts (MiberaSets on Optimism)
- **FracturedMibera tracking**: 10 soulbound companion collections, same 10k token IDs
- **Tarot / Drug correlations**: Rich analytics unique to Miberas (drug ↔ tarot ↔ archetype ↔ sale price correlations)
- **Multi-collection**: Reusable architecture for other Berachain NFT collections

---

## 14. Source Tracing

| Decision | Source |
|----------|--------|
| Use `miberas.jsonl` for initial import (not IPFS) | mibera-codex analysis — `_codex/data/miberas.jsonl` exists (6.4 MB, all 10k tokens) |
| Use `swag_score` / `swag_rank` (not custom rarity) | mibera-codex schema — `mibera.schema.json`, `stats.md` |
| 8-tier rank: SSS > SS > S > A > B > C > D > F | mibera-codex `_codex/data/stats.md` |
| Contract address `0x6666...420`, chain ID 80094 | mibera-codex `_codex/data/contracts.json` |
| Image URLs at `mibera.fsn1.your-objectstorage.com` | mibera-codex trait files |
| 42 Grails from `grails.jsonl` | mibera-codex README + `_codex/data/grails.jsonl` |
| Transfer event indexing for owner mapping | PRD + mibera-codex (ERC-721C, no `tokensOfOwner`) |
| ISR revalidation (no cron for floor price) | PRD interview: "ISR + revalidation" |
| Supabase (vs Neon) | Architecture decision: Storage + Realtime + admin UI fit better for MibeStats |
| GitHub Actions for daily sync | PRD interview — existing familiarity, free cron |

---

*Generated by /architect on 2026-02-20*
*Next step: /sprint-plan — Break down into implementation sprints*
