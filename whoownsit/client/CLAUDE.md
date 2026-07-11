# client/ — React frontend

Vite + React app (plain JS, no TypeScript). Runtime deps: `react`, `react-dom`, `recharts` only.

## Files

- `vite.config.js` — dev server config. Its one critical job: proxy `/api` →
  `http://localhost:5001` so the client never knows a backend URL or holds a key.
- `index.html` / `src/main.jsx` — standard Vite shell; `main.jsx` mounts `<App />`.
- `src/App.jsx` — the traffic cop. Holds the only real state: `phase`
  (`scan → loading → done`) and the `result` JSON. When done, it switches screens on
  `result.status`: `US_PUBLIC` → ResultScreen, `PRIVATE` → PrivateScreen,
  `FOREIGN` → ForeignScreen, anything else (`UNIDENTIFIABLE`, `ERROR`,
  `TICKER_NOT_VERIFIED`) → RetryScreen with the message.
- `src/index.css` — the ENTIRE visual identity: dark fintech theme as CSS variables
  (near-black background, green for gains, red for losses, clean sans-serif), centered
  card layout ~640px max width. Plain CSS only, no Tailwind.
- `src/api/client.js` — the only network code: `analyzeImage(file, monthly)` packs the
  photo into `FormData` (field name `image`) and POSTs to `/api/analyze?monthly=...`.
- `src/utils/dca.js` — client copy of the DCA math so the $/month slider recomputes
  **instantly with zero network calls**. MUST stay line-for-line identical to
  `server/utils/dca.js` (same rounding: money 2dp, shares 4dp; same disclaimer note).
- `src/components/` — one file per screen/widget (see `src/components/CLAUDE.md`).

## Rules

- Only relative `/api/...` fetches. No secrets, no absolute backend URLs.
- The DCA slider must never call the network — recompute client-side from
  `monthly_buys` + `share_price` that `/api/analyze` already returned.
