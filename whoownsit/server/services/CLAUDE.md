# server/services/ — the outside world (Gemini + FMP)

Everything that leaves the machine lives here, so it can be tested in isolation and the
rest of the server stays offline-friendly.

## gemini.js — the AI engine

- `identifyOwner(buffer, mimeType)` using the `@google/genai` SDK: image bytes as
  `inlineData` (base64) + the locked ownership prompt, `temperature: 0.2`,
  `responseMimeType: "application/json"`, model from `process.env.GEMINI_MODEL`.
- Parse the reply defensively: strip ``` fences before `JSON.parse`.
- **Confidence gate:** after parsing, if `confidence < 0.7` and status isn't already
  `UNIDENTIFIABLE`, force `status = "UNIDENTIFIABLE"`. Never guess.
- The prompt encodes LOCKED product rules — change only with the whole team's sign-off:
  brand owner beats licensor (LEGO Star Wars → The LEGO Group, license goes in
  `licensing_note`); full bottom-up ownership chain; US_PUBLIC only for primary US
  listings (ADRs = FOREIGN, ticker null); prefer the common/voting class (GOOGL over
  GOOG); sanity-check corporate actions (Pringles → Kellanova `K`, not "Kellogg's").
- Returns the raw Gemini JSON: `{ status, product_name, brand, ownership_chain,
  ultimate_parent, ticker, exchange, country, licensing_note, summary, confidence }`.

## fmp.js — stock data (Financial Modeling Prep)

- Node built-in `fetch` only. Free tier ≈ 250 calls/day → always go through
  `utils/cache.js`; be frugal when testing.
- `fmpGet(stablePath, v3Path, params)` — resilience story: try
  `https://financialmodelingprep.com/stable/{stablePath}` first, fall back to
  `https://financialmodelingprep.com/api/v3/{v3Path}`. Append `apikey` from env.
  Success = HTTP 200 with non-empty body; otherwise return null, never throw.
- `getProfile(ticker)` → stable `profile?symbol=T` / v3 `profile/T`. First array element
  mapped to `{ company_name: companyName, price, exchange: exchange||exchangeShortName,
  sector, logo_url: image, description: first 400 chars }`; null if empty.
- `getDailyHistory(ticker)` → stable `historical-price-eod/full?symbol=T&from=&to=` /
  v3 `historical-price-full/T?from=&to=`, `from` = today − 420 days. Body may be a bare
  array or `{ historical: [...] }`. Map to `{ date, price }` preferring `adjClose` over
  `close`, sort ascending by date; null if empty.
- A null from either function makes the route return `TICKER_NOT_VERIFIED` — that's the
  hallucination guard: no stock data renders unless FMP confirms the ticker.
