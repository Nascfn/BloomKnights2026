# server/ — Express backend (Node 18+, ES modules)

This is an **Express** server. NOT Python, NOT Flask — any doc mentioning
`whoownsit_backend.py` is obsolete. Deps: `express`, `multer`, `dotenv`,
`@google/genai` only. Uses Node's built-in `fetch` (no axios).

## Files

- `index.js` — entry: dotenv, Express app, `express.json()`, mount `routes/analyze.js`
  at `/api`, listen on `process.env.PORT || 5001`. Dev: `node --watch index.js`.
- `.env` (gitignored) / `.env.example` — `GEMINI_API_KEY`, `FMP_API_KEY`,
  `GEMINI_MODEL=gemini-3.5-flash`, `PORT=5001`. Both keys are required — the app
  is live-only (mock mode removed 2026-07-11).
- `routes/analyze.js` — the orchestrator; owns the frozen contract below.
- `services/gemini.js`, `services/fmp.js` — external world (see `services/CONTEXT.md`).
- `utils/dca.js` — canonical DCA math: `firstTradingDays(daily)` (first row of each of
  the last 12 calendar months incl. current) and `dcaResult(monthly, buys, latestPrice)`
  (shares = Σ monthly/price; money 2dp, shares 4dp; fixed disclaimer note).
  The client mirror at `client/src/utils/dca.js` must match exactly.
- `utils/cache.js` — JSON file cache at `server/data/cache.json`, keyed by ticker,
  valid for the calendar day it was written. Mandatory: FMP free tier ≈ 250 calls/day.
- `scripts/prewarm.js` — `node scripts/prewarm.js` caches the demo tickers:
  PEP KO AAPL MSFT NKE MCD PG HSY GIS MDLZ SBUX COST WMT CROX YETI
  (K removed — Kellanova delisted after the Mars buyout; stale data is skipped).
- `data/` — runtime cache lands here; gitignored.

## FROZEN API contract

### POST /api/analyze?monthly=100 — multipart form, field `image` (multer memoryStorage; image never touches disk)

Flow: Gemini → branch on status → for US_PUBLIC: cache-or-FMP → if profile/history
fails OR the latest close is >14 days old (delisting guard) → `TICKER_NOT_VERIFIED` →
else build response, cache payload, compute `dca`. Whole route try/catch → 500
`{status:"ERROR",message}`.

One JSON object; client switches UI on `status`:

- `US_PUBLIC`: `status, product_name, brand, ownership_chain[], ultimate_parent, ticker,
  licensing_note, summary, company {company_name, price, exchange, sector, logo_url,
  description}, share_price, as_of, chart[] ({date, price}, last 260 daily points),
  monthly_buys[] (12 first-trading-day points), dca {monthly_amount, months,
  total_invested, shares_owned, current_value, profit, return_pct, note}`
- `PRIVATE` / `FOREIGN`: ONLY `status, product_name, brand, ownership_chain,
  ultimate_parent, country, licensing_note, summary`
- `UNIDENTIFIABLE`: `status` + fixed `message` ("Couldn't identify a branded product —
  try again with the logo or packaging clearly in frame.")
- `TICKER_NOT_VERIFIED`: `status, gemini {...}, message`

### GET /api/calc?ticker=PEP&monthly=250
Fresh `dca` object from cache; **404 JSON if ticker not cached**. The frontend slider
does NOT use this (it recomputes client-side).

### GET /api/health
`{ "ok": true }`
